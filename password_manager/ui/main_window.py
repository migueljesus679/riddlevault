import tkinter as tk
from tkinter import ttk, messagebox

import customtkinter as ctk
import pyperclip

from vault import Vault, VaultEntry
from ui.entry_dialog import EntryDialog


class MainWindow(ctk.CTk):
    def __init__(self, vault: Vault, on_lock):
        super().__init__()
        self._vault = vault
        self._on_lock = on_lock
        self._selected_category = "All"
        self._search_var = tk.StringVar()
        self._search_var.trace_add("write", lambda *_: self._refresh_list())
        self._clipboard_job = None

        self.title("Password Manager")
        self.minsize(750, 500)
        self._center(900, 580)
        self.protocol("WM_DELETE_WINDOW", self._on_close)

        self._build_ui()
        self._refresh_categories()
        self._refresh_list()

    def _center(self, w, h):
        self.update_idletasks()
        sw = self.winfo_screenwidth()
        sh = self.winfo_screenheight()
        x = (sw - w) // 2
        y = (sh - h) // 2
        self.geometry(f"{w}x{h}+{x}+{y}")

    def _build_ui(self):
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self._build_sidebar()
        self._build_main_area()

    def _build_sidebar(self):
        sidebar = ctk.CTkFrame(self, width=160, corner_radius=0)
        sidebar.grid(row=0, column=0, sticky="nsew")
        sidebar.grid_rowconfigure(2, weight=1)

        ctk.CTkLabel(
            sidebar,
            text="Categories",
            font=ctk.CTkFont(weight="bold"),
            anchor="w",
        ).grid(row=0, column=0, padx=12, pady=(16, 4), sticky="ew")

        ttk.Separator(sidebar, orient="horizontal").grid(
            row=1, column=0, sticky="ew", padx=8, pady=4
        )

        self._cat_frame = ctk.CTkScrollableFrame(sidebar, fg_color="transparent")
        self._cat_frame.grid(row=2, column=0, sticky="nsew", padx=4, pady=4)

        ctk.CTkButton(
            sidebar,
            text="Lock",
            fg_color="transparent",
            border_width=1,
            text_color=("gray10", "gray90"),
            command=self._lock,
        ).grid(row=3, column=0, padx=10, pady=12, sticky="ew")

    def _build_main_area(self):
        main = ctk.CTkFrame(self, fg_color="transparent")
        main.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)
        main.grid_rowconfigure(1, weight=1)
        main.grid_columnconfigure(0, weight=1)

        top_bar = ctk.CTkFrame(main, fg_color="transparent")
        top_bar.grid(row=0, column=0, sticky="ew", pady=(0, 8))
        top_bar.grid_columnconfigure(0, weight=1)

        ctk.CTkEntry(
            top_bar,
            placeholder_text="Search entries...",
            textvariable=self._search_var,
        ).grid(row=0, column=0, sticky="ew", padx=(0, 8))

        ctk.CTkButton(
            top_bar, text="+ Add Entry", width=110, command=self._add_entry
        ).grid(row=0, column=1)

        tree_frame = ctk.CTkFrame(main)
        tree_frame.grid(row=1, column=0, sticky="nsew")
        tree_frame.grid_rowconfigure(0, weight=1)
        tree_frame.grid_columnconfigure(0, weight=1)

        style = ttk.Style()
        style.theme_use("clam")
        style.configure(
            "Vault.Treeview",
            background="#2b2b2b",
            foreground="white",
            fieldbackground="#2b2b2b",
            rowheight=28,
            font=("Segoe UI", 10),
        )
        style.configure("Vault.Treeview.Heading", font=("Segoe UI", 10, "bold"))
        style.map("Vault.Treeview", background=[("selected", "#1f538d")])

        self._tree = ttk.Treeview(
            tree_frame,
            columns=("title", "username", "category"),
            show="headings",
            selectmode="browse",
            style="Vault.Treeview",
        )
        self._tree.heading("title", text="Title")
        self._tree.heading("username", text="Username")
        self._tree.heading("category", text="Category")
        self._tree.column("title", width=240)
        self._tree.column("username", width=220)
        self._tree.column("category", width=120)
        self._tree.grid(row=0, column=0, sticky="nsew")

        sb = ttk.Scrollbar(tree_frame, orient="vertical", command=self._tree.yview)
        self._tree.configure(yscrollcommand=sb.set)
        sb.grid(row=0, column=1, sticky="ns")

        self._tree.bind("<<TreeviewSelect>>", lambda _: self._on_select())
        self._tree.bind("<Double-1>", lambda _: self._edit_entry())

        action_bar = ctk.CTkFrame(main, fg_color="transparent")
        action_bar.grid(row=2, column=0, sticky="ew", pady=(8, 0))

        self._btn_edit = ctk.CTkButton(
            action_bar, text="Edit", width=100, state="disabled", command=self._edit_entry
        )
        self._btn_edit.pack(side="left", padx=(0, 8))

        self._btn_delete = ctk.CTkButton(
            action_bar,
            text="Delete",
            width=100,
            state="disabled",
            fg_color="#c0392b",
            hover_color="#922b21",
            command=self._delete_entry,
        )
        self._btn_delete.pack(side="left", padx=(0, 8))

        self._btn_copy = ctk.CTkButton(
            action_bar,
            text="Copy Password",
            width=140,
            state="disabled",
            command=self._copy_password,
        )
        self._btn_copy.pack(side="left")

        self._status_label = ctk.CTkLabel(
            action_bar, text="", text_color="gray", font=ctk.CTkFont(size=11)
        )
        self._status_label.pack(side="left", padx=12)

    def _refresh_categories(self):
        for widget in self._cat_frame.winfo_children():
            widget.destroy()

        all_cats = ["All"] + self._vault.categories()
        for cat in all_cats:
            is_sel = cat == self._selected_category
            btn = ctk.CTkButton(
                self._cat_frame,
                text=cat,
                anchor="w",
                fg_color=("#1f538d" if is_sel else "transparent"),
                hover_color=("#1a4a7a" if is_sel else ("gray80", "gray30")),
                text_color=("gray10", "gray90"),
                command=lambda c=cat: self._select_category(c),
            )
            btn.pack(fill="x", pady=2, padx=2)

    def _select_category(self, category: str):
        self._selected_category = category
        self._refresh_categories()
        self._refresh_list()

    def _refresh_list(self):
        query = self._search_var.get().strip()
        if query:
            entries = self._vault.search(query)
            if self._selected_category != "All":
                entries = [e for e in entries if e.category == self._selected_category]
        else:
            entries = self._vault.filter_by_category(self._selected_category)

        self._tree.delete(*self._tree.get_children())
        for entry in entries:
            self._tree.insert("", "end", iid=entry.id, values=(entry.title, entry.username, entry.category))

        self._on_select()

    def _on_select(self):
        sel = self._tree.selection()
        has_sel = bool(sel)
        state = "normal" if has_sel else "disabled"
        self._btn_edit.configure(state=state)
        self._btn_delete.configure(state=state)
        self._btn_copy.configure(state=state)

    def _selected_entry(self):
        sel = self._tree.selection()
        if not sel:
            return None
        return self._vault.get_by_id(sel[0])

    def _add_entry(self):
        EntryDialog(self, self._vault, entry=None, on_save=self._after_save)

    def _edit_entry(self):
        entry = self._selected_entry()
        if entry:
            EntryDialog(self, self._vault, entry=entry, on_save=self._after_save)

    def _delete_entry(self):
        entry = self._selected_entry()
        if not entry:
            return
        if messagebox.askyesno(
            "Delete Entry",
            f'Delete "{entry.title}"? This cannot be undone.',
            parent=self,
        ):
            self._vault.delete(entry.id)
            self._after_save()

    def _after_save(self):
        self._refresh_categories()
        self._refresh_list()

    def _copy_password(self):
        entry = self._selected_entry()
        if not entry:
            return
        pyperclip.copy(entry.password)
        self._set_status("Password copied! Clears in 30s.")

        if self._clipboard_job:
            self.after_cancel(self._clipboard_job)
        self._clipboard_job = self.after(30_000, self._clear_clipboard)

    def _clear_clipboard(self):
        pyperclip.copy("")
        self._set_status("Clipboard cleared.")
        self._clipboard_job = self.after(3_000, lambda: self._set_status(""))

    def _set_status(self, msg: str):
        self._status_label.configure(text=msg)

    def _lock(self):
        if self._clipboard_job:
            self.after_cancel(self._clipboard_job)
        pyperclip.copy("")
        self._vault.destroy()
        self.destroy()
        self._on_lock()

    def _on_close(self):
        self._lock()
