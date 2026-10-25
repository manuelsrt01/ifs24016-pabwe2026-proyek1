import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { LoginPage, RegisterPage } from "../pages/AuthPages.jsx";

const renderWith = (ui, ctx = {}, route = "/login") =>
  render(
    <AuthContext.Provider
      value={{
        status: "guest",
        user: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        setUser: vi.fn(),
        ...ctx,
      }}
    >
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  );

describe("LoginPage", () => {
  it("menolak form kosong tanpa memanggil login", async () => {
    const login = vi.fn();
    renderWith(<LoginPage />, { login });
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("memanggil login dengan email ter-trim", async () => {
    const login = vi.fn().mockResolvedValue({ id: 1 });
    renderWith(<LoginPage />, { login });
    await userEvent.type(screen.getByLabelText("Email"), "  budi@example.com ");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia123");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(login).toHaveBeenCalledWith({
      email: "budi@example.com",
      password: "rahasia123",
    });
  });

  it("setelah masuk kembali ke halaman yang semula dituju", async () => {
    const login = vi.fn().mockResolvedValue({ id: 1 });
    render(
      <AuthContext.Provider
        value={{
          status: "guest",
          user: null,
          login,
          register: vi.fn(),
          logout: vi.fn(),
          setUser: vi.fn(),
        }}
      >
        <MemoryRouter
          initialEntries={[{ pathname: "/login", state: { from: "/books" } }]}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/books" element={<p>Halaman Buku</p>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    await userEvent.type(screen.getByLabelText("Email"), "budi@example.com");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia123");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByText("Halaman Buku")).toBeInTheDocument();
  });

  it("menampilkan pesan kesalahan dari server dan mengaktifkan tombol kembali", async () => {
    const login = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("Email atau kata sandi salah"), {
          status: 401,
        }),
      );
    renderWith(<LoginPage />, { login });
    await userEvent.type(screen.getByLabelText("Email"), "budi@example.com");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "salah-banget");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email atau kata sandi salah",
    );
    expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled();
  });

  it("memakai pesan umum bila error tidak punya pesan", async () => {
    renderWith(<LoginPage />, { login: vi.fn().mockRejectedValue({}) });
    await userEvent.type(screen.getByLabelText("Email"), "budi@example.com");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Terjadi kesalahan",
    );
  });

  it("tautan ke halaman daftar tersedia", () => {
    renderWith(<LoginPage />);
    expect(screen.getByRole("link", { name: "Daftar" })).toHaveAttribute(
      "href",
      "/auth/register",
    );
  });

  it("pengguna yang sudah masuk diarahkan dari halaman login", () => {
    renderWith(<LoginPage />, { status: "authed" });
    expect(screen.queryByRole("heading", { name: "Masuk" })).toBeNull();
  });
});

describe("RegisterPage", () => {
  it("mengirim nama, email, dan sandi (tanpa konfirmasi) ke register", async () => {
    const register = vi.fn().mockResolvedValue({ id: 1 });
    renderWith(<RegisterPage />, { register }, "/register");
    await userEvent.type(screen.getByLabelText("Nama"), "Budi");
    await userEvent.type(screen.getByLabelText("Email"), "budi@example.com");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia123");
    await userEvent.type(
      screen.getByLabelText("Ulangi kata sandi"),
      "rahasia123",
    );
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(register).toHaveBeenCalledWith({
      name: "Budi",
      email: "budi@example.com",
      password: "rahasia123",
    });
  });

  it("menolak konfirmasi sandi yang berbeda", async () => {
    const register = vi.fn();
    renderWith(<RegisterPage />, { register }, "/register");
    await userEvent.type(screen.getByLabelText("Nama"), "Budi");
    await userEvent.type(screen.getByLabelText("Email"), "budi@example.com");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia123");
    await userEvent.type(
      screen.getByLabelText("Ulangi kata sandi"),
      "beda-sekali",
    );
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(
      await screen.findByText("Konfirmasi kata sandi tidak sama"),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("menampilkan error field dari server (email sudah terdaftar)", async () => {
    const err = Object.assign(new Error("Email sudah terdaftar"), {
      details: { email: "Email sudah terdaftar" },
    });
    renderWith(
      <RegisterPage />,
      { register: vi.fn().mockRejectedValue(err) },
      "/register",
    );
    await userEvent.type(screen.getByLabelText("Nama"), "Budi");
    await userEvent.type(screen.getByLabelText("Email"), "budi@example.com");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia123");
    await userEvent.type(
      screen.getByLabelText("Ulangi kata sandi"),
      "rahasia123",
    );
    await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
    expect(await screen.findAllByText("Email sudah terdaftar")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/auth/login",
    );
  });
});
