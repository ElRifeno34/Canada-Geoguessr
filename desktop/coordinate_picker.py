"""Click on the map to record city positions.

Each click asks for a city name in the terminal. When the window is closed, the
clicks are written to picked_coordinates.csv (same format as city_coordinates.csv),
so the game's data is never overwritten by accident.
"""

import csv
import tkinter as tk
from pathlib import Path

from PIL import Image, ImageTk

HERE = Path(__file__).resolve().parent
MAP_PATH = HERE / "canada-map.png"
OUTPUT_PATH = HERE / "picked_coordinates.csv"

img = Image.open(MAP_PATH)
img_width, img_height = img.size

root = tk.Tk()
root.title("City Coordinate Picker")

canvas = tk.Canvas(root, width=img_width, height=img_height)
canvas.pack()
tk_img = ImageTk.PhotoImage(img)
canvas.create_image(0, 0, anchor="nw", image=tk_img)

cities = []  # (city, x, y), with x and y as fractions of the map size


def on_click(event):
    x_norm = event.x / img_width
    y_norm = event.y / img_height
    city = input(f"Clicked at {x_norm:.2f}, {y_norm:.2f}. Enter city name: ").strip()
    if city:
        cities.append((city, round(x_norm, 2), round(y_norm, 2)))
        print(f"Saved: {city} -> {x_norm:.2f}, {y_norm:.2f}")


def on_close():
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["city", "x", "y"])
        writer.writerows(cities)
    print(f"Coordinates saved to {OUTPUT_PATH.name}")
    root.destroy()


canvas.bind("<Button-1>", on_click)
root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop()
