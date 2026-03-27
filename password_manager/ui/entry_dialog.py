import re
import tkinter as tk

import customtkinter as ctk

from typing import Optional, Tuple

from vault import Vault, VaultEntry

DEFAULT_CATEGORIES = ["General", "Social", "Work", "Finance", "Shopping", "Email", "Other"]


def _password_strength(pwd: str) -> Tuple[str, str]:
    score = 0
    if len(pwd) >= 8:
        score += 1
    if len(pwd) >= 12:
        score += 1
    if re.search(r"[A-Z]", pwd):
        score += 1
    if re.search(r"[0-9]", pwd):
        score += 1
    if re.search(r"[^A-Za-z0-9]", pwd):
        score += 1

    if score <= 1:
        return "Weak", "#e05555"
    elif score <= 3:
        return "Medium", "#e0a800"
    else:
        return "Strong", "#2ecc71"


class EntryDialog(ctk.CTkToplevel):
    def __init__(self, parent, vault: Vault, entry: Optional[VaultEntry], on_save):
        super().__init__(parent)
        self._vault = vault
        self._entry = entry
        self._on_save = on_save
        self._show_password = False

        title = "Edit Entry" if entry else "Add Entry"
        self.title(title)
        self.resizable(False, False)
        self.grab_set()
        self._center(parent, 460, 520)

        self._build_ui()
        if entry:
            self._populate(entry)

    def _center(self, parent, w, h):
        self.update_idletasks()
        px = parent.winfo_rootx()
        py = parent.winfo_rooty()
        pw = parent.winfo_width()
        ph = parent.winfo_height()
        x = px + (pw - w) // 2
        y = py + (ph - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

    def _build_ui(self):
        pad = {"padx": 24, "pady": 6}

        ctk.CTkLabel(
            self,
            text="Title *",
            anchor="w",
            font=ctk.CTkFont(size=12),
        ).pack(fill="x", padx=24, pady=(20, 0))
        self._title_entry = ctk.CTkEntry(self, placeholder_text="e.g. GitHub")
        self._title_entry.pack(fill="x", **pad)

        ctk.CTkLabel(self, text="Username *", anchor="w", font=ctk.CTkFont(size=12)).pack(
            fill="x", padx=24, pady=(6, 0)
        )
        self._user_entry = ctk.CTkEntry(self, placeholder_text="user@example.com")
        self._user_entry.pack(fill="x", **pad)

        ctk.CTkLabel(self, text="Password *", anchor="w", font=ctk.CTkFont(size=12)).pack(
            fill="x", padx=24, pady=(6, 0)
        )
        pwd_row = ctk.CTkFrame(self, fg_color="transparent")
        pwd_row.pack(fill="x", **pad)
        pwd_row.grid_columnconfigure(0, weight=1)

        self._pwd_var = tk.StringVar()
        self._pwd_var.trace_add("write", lambda *_: self._update_strength())

        self._pwd_entry = ctk.CTkEntry(
            pwd_row, show="*", textvariable=self._pwd_var
        )
        self._pwd_entry.grid(row=0, column=0, sticky="ew")

        self._toggle_btn = ctk.CTkButton(
            pwd_row,
            text="Show",
            width=60,
            command=self._toggle_password,
        )
        self._toggle_btn.grid(row=0, column=1, padx=(6, 0))

        self._strength_label = ctk.CTkLabel(
            self, text="", anchor="w", font=ctk.CTkFont(size=11)
        )
        self._strength_label.pack(fill="x", padx=24)

        self._strength_bar = ctk.CTkProgressBar(self, height=6)
        self._strength_bar.pack(fill="x", padx=24, pady=(2, 4))
        self._strength_bar.set(0)

        ctk.CTkLabel(self, text="URL", anchor="w", font=ctk.CTkFont(size=12)).pack(
            fill="x", padx=24, pady=(6, 0)
        )
        self._url_entry = ctk.CTkEntry(self, placeholder_text="https://")
        self._url_entry.pack(fill="x", **pad)

        ctk.CTkLabel(self, text="Category", anchor="w", font=ctk.CTkFont(size=12)).pack(
            fill="x", padx=24, pady=(6, 0)
        )
        cats = list(dict.fromkeys(DEFAULT_CATEGORIES + self._vault.categories()))
        self._cat_var = tk.StringVar(value="General")
        self._cat_combo = ctk.CTkComboBox(self, values=cats, variable=self._cat_var)
        self._cat_combo.pack(fill="x", **pad)

        ctk.CTkLabel(self, text="Notes", anchor="w", font=ctk.CTkFont(size=12)).pack(
            fill="x", padx=24, pady=(6, 0)
        )
        self._notes_text = ctk.CTkTextbox(self, height=60)
        self._notes_text.pack(fill="x", padx=24, pady=6)

        self._error_label = ctk.CTkLabel(
            self, text="", text_color="#e05555", font=ctk.CTkFont(size=11)
        )
        self._error_label.pack()

        btn_row = ctk.CTkFrame(self, fg_color="transparent")
        btn_row.pack(fill="x", padx=24, pady=(4, 20))

        ctk.CTkButton(
            btn_row,
            text="Cancel",
            width=100,
            fg_color="transparent",
            border_width=1,
            text_color=("gray10", "gray90"),
            command=self.destroy,
        ).pack(side="right", padx=(8, 0))

        label = "Save Changes" if self._entry else "Add Entry"
        ctk.CTkButton(btn_row, text=label, width=120, command=self._save).pack(side="right")

    def _populate(self, entry: VaultEntry):
        self._title_entry.insert(0, entry.title)
        self._user_entry.insert(0, entry.username)
        self._pwd_entry.insert(0, entry.password)
        self._url_entry.insert(0, entry.url)
        self._cat_var.set(entry.category)
        self._notes_text.insert("1.0", entry.notes)

    def _toggle_password(self):
        self._show_password = not self._show_password
        self._pwd_entry.configure(show="" if self._show_password else "*")
        self._toggle_btn.configure(text="Hide" if self._show_password else "Show")

    def _update_strength(self):
        pwd = self._pwd_var.get()
        if not pwd:
            self._strength_label.configure(text="")
            self._strength_bar.set(0)
            return
        label, color = _password_strength(pwd)
        bar_val = {"Weak": 0.25, "Medium": 0.6, "Strong": 1.0}[label]
        self._strength_label.configure(text=f"Strength: {label}", text_color=color)
        self._strength_bar.set(bar_val)
        self._strength_bar.configure(progress_color=color)

    def _save(self):
        title = self._title_entry.get().strip()
        username = self._user_entry.get().strip()
        password = self._pwd_var.get()

        if not title:
            self._error_label.configure(text="Title is required.")
            return
        if not username:
            self._error_label.configure(text="Username is required.")
            return
        if not password:
            self._error_label.configure(text="Password is required.")
            return

        notes = self._notes_text.get("1.0", "end-1c").strip()
        category = self._cat_var.get().strip() or "General"
        url = self._url_entry.get().strip()

        if self._entry:
            self._vault.update(
                self._entry.id,
                title=title,
                username=username,
                password=password,
                url=url,
                category=category,
                notes=notes,
            )
        else:
            new_entry = VaultEntry(
                title=title,
                username=username,
                password=password,
                url=url,
                category=category,
                notes=notes,
            )
            self._vault.add(new_entry)

        self._on_save()
        self.destroy()
