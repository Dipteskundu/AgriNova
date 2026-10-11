"""
AgriNova Exploratory Data Analysis & Visualizations
Generates publication-quality charts and statistics for SPAS-Dataset-BD.
"""

from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from data_loader import load_and_clean_spas

FIGURES_DIR = Path(__file__).resolve().parent.parent.parent / "reports" / "figures"
FIGURES_DIR.mkdir(parents=True, exist_ok=True)


def generate_eda_reports():
    df = load_and_clean_spas()
    sns.set_theme(style="whitegrid", font_scale=1.0)
    plt.rcParams["figure.dpi"] = 300

    # 1. Seasonal Distribution
    plt.figure(figsize=(8, 5))
    season_counts = df.groupby("Season")["Crop Name"].nunique()
    ax = sns.barplot(x=season_counts.index, y=season_counts.values, palette="Greens_d")
    plt.title("Distribution of Unique Bangladesh Crops by Season (SPAS-Dataset-BD)", fontsize=13, weight="bold")
    plt.xlabel("Cropping Season", fontsize=11)
    plt.ylabel("Number of Unique Crop Species", fontsize=11)
    for p in ax.patches:
        ax.annotate(f"{int(p.get_height())} crops", (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha="center", va="center", xytext=(0, 5), textcoords="offset points", fontweight="bold")
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "seasonal_distribution.png")
    plt.close()
    print("Saved seasonal_distribution.png")

    # 2. Temperature & Humidity Distributions
    crop_unique = df.drop_duplicates(subset=["Crop Name"])
    fig, axs = plt.subplots(1, 2, figsize=(14, 5))
    sns.histplot(crop_unique["Avg Temp"], kde=True, ax=axs[0], color="#2b5c8f", bins=15)
    axs[0].set_title("Optimal Average Temperature Distribution (°C)", fontsize=12, weight="bold")
    axs[0].set_xlabel("Average Temperature (°C)")
    axs[0].set_ylabel("Crop Count")

    sns.histplot(crop_unique["Avg Humidity"], kde=True, ax=axs[1], color="#2e7d32", bins=15)
    axs[1].set_title("Optimal Average Relative Humidity Distribution (%)", fontsize=12, weight="bold")
    axs[1].set_xlabel("Average Relative Humidity (%)")
    axs[1].set_ylabel("Crop Count")
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "temperature_humidity_distributions.png")
    plt.close()
    print("Saved temperature_humidity_distributions.png")

    # 3. Top 15 Crops by Total Production in Bangladesh (BBS 2022)
    top_prod = df.groupby("Crop Name")["Production"].sum().sort_values(ascending=False).head(15) / 1e3
    plt.figure(figsize=(10, 6))
    ax = sns.barplot(x=top_prod.values, y=top_prod.index, palette="mako")
    plt.title("Top 15 Crops by Total Bangladesh Production (Thousand Metric Tons, BBS 2022)", fontsize=13, weight="bold")
    plt.xlabel("Total Production (Thousand Metric Tons)", fontsize=11)
    plt.ylabel("Crop Name", fontsize=11)
    for p in ax.patches:
        ax.annotate(f"{p.get_width():.1f}k", (p.get_width(), p.get_y() + p.get_height() / 2.),
                    ha="left", va="center", xytext=(4, 0), textcoords="offset points", fontsize=9)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "top_crops_production.png")
    plt.close()
    print("Saved top_crops_production.png")

    # 4. Top 15 Crops by Cultivated Area in Bangladesh (BBS 2022)
    top_area = df.groupby("Crop Name")["Area"].sum().sort_values(ascending=False).head(15) / 1e3
    plt.figure(figsize=(10, 6))
    ax = sns.barplot(x=top_area.values, y=top_area.index, palette="viridis")
    plt.title("Top 15 Crops by Total Harvested Area (Thousand Acres, BBS 2022)", fontsize=13, weight="bold")
    plt.xlabel("Total Cultivated Area (Thousand Acres)", fontsize=11)
    plt.ylabel("Crop Name", fontsize=11)
    for p in ax.patches:
        ax.annotate(f"{p.get_width():.1f}k", (p.get_width(), p.get_y() + p.get_height() / 2.),
                    ha="left", va="center", xytext=(4, 0), textcoords="offset points", fontsize=9)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "top_crops_area.png")
    plt.close()
    print("Saved top_crops_area.png")

    # 5. Yield Variability (AP Ratio) across Top Crops
    major_crops = ["Boro", "Aman", "Potato", "Maize 1", "Wheat", "Jute", "Lentil", "Mustard", "Onion"]
    subset = df[df["Crop Name"].isin(major_crops) & (df["AP Ratio"] > 0)]
    plt.figure(figsize=(12, 6))
    sns.boxplot(data=subset, x="Crop Name", y="AP Ratio", palette="Set2")
    plt.title("Yield (AP Ratio: Tons/Acre) Distribution Across Bangladesh Districts", fontsize=13, weight="bold")
    plt.xlabel("Major Agricultural Crops", fontsize=11)
    plt.ylabel("Yield (Metric Tons / Acre)", fontsize=11)
    plt.tight_layout()
    plt.savefig(FIGURES_DIR / "yield_variability_major_crops.png")
    plt.close()
    print("Saved yield_variability_major_crops.png")

    print(f"All EDA visualizations successfully written to {FIGURES_DIR}")


if __name__ == "__main__":
    generate_eda_reports()
