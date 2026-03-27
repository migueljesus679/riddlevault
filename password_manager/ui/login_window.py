import os
import tkinter as tk

import customtkinter as ctk
from cryptography.exceptions import InvalidTag

from vault import Vault

VAULT_FILE = os.path.join(os.path.expanduser("~"), ".password_manager.vault")


class LoginWindow(ctk.CTk):
    def __init__(self, on_success):
        super().__init__()
        self._on_success = on_success
        self._create_mode = not os.path.exists(VAULT_FILE)

        self.title("Password Manager")
        self.resizable(False, False)
        self._center(400, 320 if self._create_mode else 260)

        self._build_ui()
        self.bind("<Return>", lambda e: self._submit())

    def _center(self, w, h):
        self.update_idletasks()
        sw = self.winfo_screenwidth()
        sh = self.winfo_screenheight()
        x = (sw - w) // 2
        y = (sh - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

    def _build_ui(self):
        ctk.CTkLabel(
            self,
            text="Password Manager",
            font=ctk.CTkFont(size=22, weight="bold"),
        ).pack(pady=(30, 4))

        subtitle = "Create a new vault" if self._create_mode else "Unlock your vault"
        ctk.CTkLabel(self, text=subtitle, text_color="gray").pack(pady=(0, 20))

        self._pwd_entry = ctk.CTkEntry(
            self, placeholder_text="Master password", show="*", width=280
        )
        self._pwd_entry.pack(pady=6)
        self._pwd_entry.focus()

        if self._create_mode:
            self._confirm_entry = ctk.CTkEntry(
                self, placeholder_text="Confirm password", show="*", width=280
            )
            self._confirm_entry.pack(pady=6)

        self._error_label = ctk.CTkLabel(self, text="", text_color="#e05555")
        self._error_label.pack(pady=2)

        btn_text = "Create Vault" if self._create_mode else "Unlock"
        ctk.CTkButton(self, text=btn_text, width=280, command=self._submit).pack(pady=10)

    def _submit(self):
        pwd = self._pwd_entry.get()
        if not pwd:
            self._show_error("Password cannot be empty.")
            return

        if self._create_mode:
            confirm = self._confirm_entry.get()
            if pwd != confirm:
                self._show_error("Passwords do not match.")
                self._shake()
                return
            if len(pwd) < 8:
                self._show_error("Password must be at least 8 characters.")
                return
            vault = Vault.create(VAULT_FILE, pwd)
            vault.load()
            self._launch(vault)
        else:
            try:
                vault = Vault(VAULT_FILE, pwd)
                vault.load()
                self._launch(vault)
            except (InvalidTag, Exception):
                self._show_error("Wrong password or corrupted vault.")
                self._shake()

    def _launch(self, vault: Vault):
        self.destroy()
        self._on_success(vault)

    def _show_error(self, msg: str):
        self._error_label.configure(text=msg)

    def _shake(self):
        orig_x = self.winfo_x()
        orig_y = self.winfo_y()
        offsets = [8, -8, 6, -6, 4, -4, 0]

        def step(i=0):
            if i < len(offsets):
                self.geometry(f"+{orig_x + offsets[i]}+{orig_y}")
                self.after(40, step, i + 1)

        step()
