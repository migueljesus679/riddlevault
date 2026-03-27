import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import List, Optional

from crypto import create_vault_file, open_vault_file, save_vault_file


@dataclass
class VaultEntry:
    title: str
    username: str
    password: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    url: str = ""
    category: str = "General"
    notes: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())


class Vault:
    def __init__(self, path: str, master_password: str):
        self.path = path
        self._master_password = master_password
        self.entries: List[VaultEntry] = []

    @staticmethod
    def create(path: str, master_password: str) -> "Vault":
        create_vault_file(path, master_password)
        return Vault(path, master_password)

    def load(self) -> None:
        data = open_vault_file(self.path, self._master_password)
        self.entries = [VaultEntry(**e) for e in data.get("entries", [])]

    def save(self) -> None:
        vault_dict = {
            "version": 1,
            "entries": [asdict(e) for e in self.entries],
        }
        save_vault_file(self.path, self._master_password, vault_dict)

    def add(self, entry: VaultEntry) -> None:
        self.entries.append(entry)
        self.save()

    def update(self, entry_id: str, **fields) -> None:
        for entry in self.entries:
            if entry.id == entry_id:
                for k, v in fields.items():
                    setattr(entry, k, v)
                entry.updated_at = datetime.now().isoformat()
                break
        self.save()

    def delete(self, entry_id: str) -> None:
        self.entries = [e for e in self.entries if e.id != entry_id]
        self.save()

    def search(self, query: str) -> List[VaultEntry]:
        q = query.lower()
        return [
            e for e in self.entries
            if q in e.title.lower()
            or q in e.username.lower()
            or q in e.url.lower()
            or q in e.category.lower()
        ]

    def filter_by_category(self, category: str) -> List[VaultEntry]:
        if category == "All":
            return list(self.entries)
        return [e for e in self.entries if e.category == category]

    def categories(self) -> List[str]:
        return sorted(set(e.category for e in self.entries))

    def get_by_id(self, entry_id: str) -> Optional[VaultEntry]:
        return next((e for e in self.entries if e.id == entry_id), None)

    def destroy(self) -> None:
        self._master_password = ""
        self.entries.clear()
