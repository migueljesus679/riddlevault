import pandas as pd
from pathlib import Path


def process_csv(file_path: str, separator: str = ",") -> dict:
    try:
        df = pd.read_csv(file_path, sep=separator, nrows=1000)
    except Exception:
        df = pd.read_csv(file_path, sep=separator, nrows=1000, encoding="latin-1")

    stats = {}
    for col in df.columns:
        col_stats = {"dtype": str(df[col].dtype), "null_count": int(df[col].isnull().sum())}
        if pd.api.types.is_numeric_dtype(df[col]):
            desc = df[col].describe()
            col_stats.update({
                "mean": round(float(desc.get("mean", 0)), 2),
                "min": float(desc.get("min", 0)),
                "max": float(desc.get("max", 0)),
                "std": round(float(desc.get("std", 0)), 2),
            })
        elif pd.api.types.is_string_dtype(df[col]):
            col_stats["unique"] = int(df[col].nunique())
            top = df[col].value_counts().head(5).to_dict()
            col_stats["top_values"] = {str(k): int(v) for k, v in top.items()}
        stats[col] = col_stats

    preview = df.head(20).fillna("").to_dict(orient="records")

    return {
        "type": "csv",
        "rows": len(df),
        "columns": list(df.columns),
        "column_count": len(df.columns),
        "stats": stats,
        "preview": preview,
    }
