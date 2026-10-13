"""
AgriNova Feature Preprocessing & Pipeline Construction
Handles schema validation, feature encoding, scaling, and stratified splitting.
"""

from pathlib import Path
from typing import Tuple, List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

FEATURE_COLS_CATEGORICAL = ["District", "Season"]
FEATURE_COLS_NUMERICAL = [
    "Area", "Avg Temp", "Avg Humidity", "Max Temp", "Min Temp",
    "Max Relative Humidity", "Min Relative Humidity"
]
TARGET_COL = "Crop Name"


def create_preprocessor() -> ColumnTransformer:
    """Creates scikit-learn ColumnTransformer for categorical and numerical features."""
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), FEATURE_COLS_NUMERICAL),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), FEATURE_COLS_CATEGORICAL),
        ],
        remainder="drop"
    )


def prepare_data(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, np.ndarray, np.ndarray, LabelEncoder, ColumnTransformer]:
    """
    Extracts features and target, fits LabelEncoder on target classes,
    performs stratified train/test split, fits ColumnTransformer on train features.
    """
    X = df[FEATURE_COLS_CATEGORICAL + FEATURE_COLS_NUMERICAL].copy()
    y_raw = df[TARGET_COL].values

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)

    # Stratified split ensures every crop class is evenly represented in train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    preprocessor = create_preprocessor()
    preprocessor.fit(X_train)

    return X_train, X_test, y_train, y_test, label_encoder, preprocessor


if __name__ == "__main__":
    from data_loader import load_and_clean_spas
    df = load_and_clean_spas()
    X_train, X_test, y_train, y_test, le, prep = prepare_data(df)
    print(f"X_train shape: {X_train.shape}, y_train shape: {y_train.shape}")
    print(f"X_test shape: {X_test.shape}, y_test shape: {y_test.shape}")
    print(f"Target classes count: {len(le.classes_)}")
    X_train_trans = prep.transform(X_train)
    print(f"Preprocessed train feature matrix shape: {X_train_trans.shape}")
