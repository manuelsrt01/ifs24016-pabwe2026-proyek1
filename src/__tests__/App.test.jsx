import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.jsx";
import { ToastProvider } from "../components/Toast.jsx";
import { AuthProvider } from "../contexts/AuthContext.jsx";
import { api } from "../services/api.js";
import { makeSummary, makeUser } from "../test-utils.jsx";

vi.mock("../services/api.js", () => ({
  api: {
    me: vi.fn(),
    logout: vi.fn(),
    dashboardSummary: vi.fn(),
    listBooks: vi.fn(),
  },
  setUnauthorizedHandler: vi.fn(),
}));

const renderApp = (route = "/") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );

describe("App (routing & layout)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.dashboardSummary.mockResolvedValue(makeSummary());
    api.listBooks.mockResolvedValue([]);
  });

  it("menampilkan loading, lalu mengarahkan tamu ke halaman masuk", async () => {
    api.me.mockRejectedValue(new Error("401"));
    renderApp("/books");
    expect(screen.getByText("Memuat TanaRead…")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Masuk" }),
    ).toBeInTheDocument();
  });

  it("tamu dapat membuka halaman daftar", async () => {
    api.me.mockRejectedValue(new Error("401"));
    renderApp("/auth/register");
    expect(
      await screen.findByRole("heading", { name: "Buat Akun" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["/login", "Masuk"],
    ["/register", "Buat Akun"],
  ])(
    "alias lama %s mengarah ke halaman /auth yang sama",
    async (route, heading) => {
      api.me.mockRejectedValue(new Error("401"));
      renderApp(route);
      expect(
        await screen.findByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    },
  );

  it("/auth/login terbuka langsung tanpa redirect", async () => {
    api.me.mockRejectedValue(new Error("401"));
    renderApp("/auth/login");
    expect(
      await screen.findByRole("heading", { name: "Masuk" }),
    ).toBeInTheDocument();
  });

  it("pengguna masuk melihat dashboard, nama, dan menu navigasi", async () => {
    api.me.mockResolvedValue(makeUser());
    renderApp("/");
    expect(await screen.findByText("Total Buku")).toBeInTheDocument();
    expect(screen.getByText("budi@example.com")).toBeInTheDocument();
    for (const name of [
      "Dashboard",
      "Koleksi Buku",
      "Aktivitas Membaca",
      "Statistik",
      "Pengaturan",
    ]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("navigasi ke halaman lain lewat sidebar", async () => {
    api.me.mockResolvedValue(makeUser());
    renderApp("/");
    await userEvent.click(
      await screen.findByRole("link", { name: "Koleksi Buku" }),
    );
    expect(await screen.findByText("Belum ada buku")).toBeInTheDocument();
  });

  it("pengguna masuk yang membuka /auth/login diarahkan ke dashboard", async () => {
    api.me.mockResolvedValue(makeUser());
    renderApp("/auth/login");
    expect(await screen.findByText("Total Buku")).toBeInTheDocument();
  });

  it("rute tidak dikenal menampilkan halaman tidak ditemukan", async () => {
    api.me.mockResolvedValue(makeUser());
    renderApp("/tidak-ada");
    expect(
      await screen.findByText("Halaman tidak ditemukan"),
    ).toBeInTheDocument();
  });

  it("tombol Catat Membaca di sidebar membuka modal aktivitas", async () => {
    api.me.mockResolvedValue(makeUser());
    renderApp("/");
    await userEvent.click(
      await screen.findByRole("button", { name: "Catat Membaca" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Catat Aktivitas Membaca" }),
    ).toBeInTheDocument();
  });

  it("tombol Keluar mengakhiri sesi dan kembali ke halaman masuk", async () => {
    api.me.mockResolvedValue(makeUser());
    api.logout.mockResolvedValue(null);
    renderApp("/");
    await userEvent.click(
      await screen.findByRole("button", { name: "Keluar" }),
    );
    await waitFor(() => expect(api.logout).toHaveBeenCalled());
    expect(
      await screen.findByRole("heading", { name: "Masuk" }),
    ).toBeInTheDocument();
  });
});
