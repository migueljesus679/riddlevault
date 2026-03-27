import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import customtkinter as ctk

from ui.login_window import LoginWindow
from ui.main_window import MainWindow


def start_app():
    ctk.set_appearance_mode("system")
    ctk.set_default_color_theme("blue")

    def show_login():
        login = LoginWindow(on_success=show_main)
        login.mainloop()

    def show_main(vault):
        main = MainWindow(vault=vault, on_lock=show_login)
        main.mainloop()

    show_login()


if __name__ == "__main__":
    start_app()
