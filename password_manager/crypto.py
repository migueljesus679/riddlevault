import hashlib
import json
import os

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


PBKDF2_ITERATIONS = 600_000
SALT_SIZE = 16
NONCE_SIZE = 12


def generate_salt() -> bytes:
    return os.urandom(SALT_SIZE)


def derive_key(master_password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac(
        "sha256",
        master_password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
        dklen=32,
    )


def encrypt(plaintext: bytes, key: bytes) -> bytes:
    nonce = os.urandom(NONCE_SIZE)
    aesgcm = AESGCM(key)
    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext, None)
    return nonce + ciphertext_with_tag


def decrypt(data: bytes, key: bytes) -> bytes:
    nonce = data[:NONCE_SIZE]
    ciphertext_with_tag = data[NONCE_SIZE:]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext_with_tag, None)


def create_vault_file(path: str, master_password: str) -> None:
    salt = generate_salt()
    key = derive_key(master_password, salt)
    empty_vault = json.dumps({"version": 1, "entries": []}).encode("utf-8")
    encrypted = encrypt(empty_vault, key)
    with open(path, "wb") as f:
        f.write(salt + encrypted)


def open_vault_file(path: str, master_password: str) -> dict:
    with open(path, "rb") as f:
        raw = f.read()
    salt = raw[:SALT_SIZE]
    encrypted = raw[SALT_SIZE:]
    key = derive_key(master_password, salt)
    plaintext = decrypt(encrypted, key)
    return json.loads(plaintext.decode("utf-8"))


def save_vault_file(path: str, master_password: str, vault_dict: dict) -> None:
    salt = generate_salt()
    key = derive_key(master_password, salt)
    plaintext = json.dumps(vault_dict).encode("utf-8")
    encrypted = encrypt(plaintext, key)
    with open(path, "wb") as f:
        f.write(salt + encrypted)
