import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import csv

# Path to your Canada map
MAP_PATH = "canada-map.png"

# Load image
img = Image.open(MAP_PATH)
img_width, img_height = img.size

# Tkinter setup
root = tk.Tk()
root.title("City Coordinate Picker")

canvas = tk.Canvas(root, width=img_width, height=img_height)
canvas.pack()

tk_img = ImageTk.PhotoImage(img)
canvas.create_image(0, 0, anchor="nw", image=tk_img)

cities = []  # store (city, x, y)

def on_click(event):
    # Normalize coords
    x_norm = event.x / img_width
    y_norm = event.y / img_height

    # Ask for city name
    city = input(f"Clicked at {x_norm:.2f}, {y_norm:.2f}. Enter city name: ")
    if city.strip():
        cities.append((city, round(x_norm, 2), round(y_norm, 2)))
        print(f"Saved: {city} -> {x_norm:.2f}, {y_norm:.2f}")

def on_close():
    # Save CSV with semicolon separator
    with open("city_coordinates.csv", "w", newline="") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["city", "x", "y"])
        writer.writerows(cities)
    print("Coordinates saved to city_coordinates.csv")
    root.destroy()

canvas.bind("<Button-1>", on_click)
root.protocol("WM_DELETE_WINDOW", on_close)

root.mainloop()
