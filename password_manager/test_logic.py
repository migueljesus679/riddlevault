import sys
import os
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from crypto import create_vault_file, open_vault_file, save_vault_file
from cryptography.exceptions import InvalidTag
from vault import Vault, VaultEntry

errors = []

# --- crypto round-trip ---
with tempfile.NamedTemporaryFile(delete=False, suffix=".vault") as f:
    vault_path = f.name

try:
    create_vault_file(vault_path, "masterpass123")
    data = open_vault_file(vault_path, "masterpass123")
    assert data["version"] == 1 and data["entries"] == [], "Empty vault mismatch"
    print("PASS crypto: create + open empty vault")

    wrong = False
    try:
        open_vault_file(vault_path, "wrongpassword")
    except (InvalidTag, Exception) as e:
        wrong = True
    assert wrong, "Wrong password should raise"
    print("PASS crypto: wrong password rejected")

    # --- vault CRUD ---
    vault = Vault(vault_path, "masterpass123")
    vault.load()
    assert vault.entries == [], "Should be empty after load"

    e1 = VaultEntry(title="GitHub", username="alice@example.com", password="p@ss1!", category="Work", url="https://github.com")
    e2 = VaultEntry(title="Gmail", username="alice@gmail.com", password="g@mail!", category="Email")
    vault.add(e1)
    vault.add(e2)
    assert len(vault.entries) == 2, "Should have 2 entries"
    print("PASS vault: add entries")

    vault2 = Vault(vault_path, "masterpass123")
    vault2.load()
    assert len(vault2.entries) == 2, "Persisted entries should reload"
    print("PASS vault: persist and reload")

    results = vault2.search("github")
    assert len(results) == 1 and results[0].title == "GitHub"
    print("PASS vault: search")

    cats = vault2.filter_by_category("Email")
    assert len(cats) == 1 and cats[0].title == "Gmail"
    print("PASS vault: filter by category")

    vault2.update(e1.id, title="GitHub Updated", password="newpass!")
    vault3 = Vault(vault_path, "masterpass123")
    vault3.load()
    updated = vault3.get_by_id(e1.id)
    assert updated.title == "GitHub Updated" and updated.password == "newpass!"
    print("PASS vault: update entry")

    vault3.delete(e2.id)
    vault4 = Vault(vault_path, "masterpass123")
    vault4.load()
    assert len(vault4.entries) == 1
    print("PASS vault: delete entry")

    cats_list = vault4.categories()
    assert "Work" in cats_list
    print("PASS vault: categories list")

except AssertionError as ex:
    print(f"FAIL: {ex}")
    errors.append(str(ex))
finally:
    os.unlink(vault_path)

if errors:
    print(f"\n{len(errors)} test(s) FAILED")
    sys.exit(1)
else:
    print("\nAll tests passed.")
