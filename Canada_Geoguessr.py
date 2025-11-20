import tkinter as tk
from tkinter import messagebox
import pandas as pd
import random
from PIL import Image, ImageTk  # pip install pillow

# === Load data (CSV only has city;x;y) ===
data = pd.read_csv("city_coordinates.csv", sep=";")
data["x"] = data["x"].astype(str).str.replace(",", ".").astype(float)
data["y"] = data["y"].astype(str).str.replace(",", ".").astype(float)
all_cities = data["city"].to_list()
guessed_cities = []

# === Hints stored in Python (not CSV) ===
hints = {
    "Toronto": "This city is home to the CN Tower.",
    "Montreal": "Known for its French heritage and its famous Jazz Festival.",
    "Vancouver": "Hosted the 2010 Winter Olympics.",
    "Calgary": "Famous for the Calgary Stampede rodeo.",
    "Ottawa": "Canada's capital city, home to Parliament Hill.",
    "Quebec City": "The only walled city north of Mexico.",
}

# === Educational Facts & (optional) images ===
city_info = {
    "Toronto": {"fact": "Toronto is the largest city in Canada.", "image": "images/toronto.png"},
    "Montreal": {"fact": "Montreal is the second largest French-speaking city in the world.", "image": "images/montreal.png"},
    "Vancouver": {"fact": "Vancouver is surrounded by mountains and ocean.", "image": "images/vancouver.png"},
    "Calgary": {"fact": "Calgary is a gateway to the Rocky Mountains.", "image": None},
    "Ottawa": {"fact": "Ottawa hosts the Canadian Tulip Festival every spring.", "image": None},
    "Quebec City": {"fact": "Founded in 1608, Quebec City is one of North America's oldest cities.", "image": None},
}

# === Game Variables ===
lives = 5  # max wrong guesses
wrong_guesses = 0
city_images = {}  # keep references to avoid garbage collection

# === Tkinter setup ===
root = tk.Tk()
root.title("Canadian Cities Game")

# Frames: map on left, info panel on right
frame_map = tk.Frame(root)
frame_map.pack(side="left")

frame_info = tk.Frame(root, width=300)
frame_info.pack(side="right", fill="y")

# Load + resize map
map_img_raw = Image.open("canada-map.png")
map_img_raw = map_img_raw.resize((1200, 900), Image.LANCZOS)
map_img = ImageTk.PhotoImage(map_img_raw)

map_width, map_height = map_img.width(), map_img.height()
canvas = tk.Canvas(frame_map, width=map_width, height=map_height)
canvas.create_image(0, 0, anchor="nw", image=map_img)
canvas.pack()

# === Info panel ===
info_label = tk.Label(frame_info, text="Discovered Cities:", font=("Arial", 14, "bold"))
info_label.pack(pady=5)

info_text = tk.Text(frame_info, wrap="word", width=40, height=40)
info_text.pack(padx=5, pady=5)

# Entry field
entry = tk.Entry(root, font=("Arial", 14))
canvas.create_window(map_width // 2, 20, window=entry)

# === Functions ===
def check_answer():
    global wrong_guesses
    answer = entry.get().title().strip()
    entry.delete(0, tk.END)

    if answer in all_cities and answer not in guessed_cities:
        guessed_cities.append(answer)

        city_data = data[data["city"] == answer]
        x = float(city_data["x"].values[0]) * map_width
        y = float(city_data["y"].values[0]) * map_height

        # --- Draw dot ---
        r = 6
        canvas.create_oval(x-r, y-r, x+r, y+r, fill="black", outline="white", width=2)

        # --- Draw city name ---
        canvas.create_text(x + 15, y + 11, text=answer, font=("Arial", 10, "bold"), fill="black")

        # --- Show educational fact ---
        if answer in city_info:
            fact = city_info[answer]["fact"]
            info_text.insert(tk.END, f"\n{answer}: {fact}\n")

            # --- Show image if available ---
            img_path = city_info[answer].get("image")
            if img_path:
                try:
                    img = Image.open(img_path).resize((150, 100), Image.LANCZOS)
                    img_tk = ImageTk.PhotoImage(img)
                    city_images[answer] = img_tk  # keep reference
                    info_text.image_create(tk.END, image=img_tk)
                    info_text.insert(tk.END, "\n")
                except Exception as e:
                    print(f"Could not load image for {answer}: {e}")

        if len(guessed_cities) == len(all_cities):
            messagebox.showinfo("Congrats!", "You guessed all the cities!")

    else:
        wrong_guesses += 1
        remaining = lives - wrong_guesses
        if remaining <= 0:
            messagebox.showerror("Game Over", "You ran out of lives!")
            root.destroy()
        else:
            messagebox.showwarning("Wrong!", f"Wrong guess! {remaining} lives left.")

def show_hint():
    remaining = [c for c in all_cities if c not in guessed_cities]
    if not remaining:
        messagebox.showinfo("Hint", "No more cities left!")
        return
    city = random.choice(remaining)
    hint = hints.get(city, "No hint available for this city.")
    messagebox.showinfo("Hint", f"Hint for one city:\n{hint}")

# Buttons
button = tk.Button(root, text="Guess", command=check_answer)
canvas.create_window(map_width // 2 + 100, 20, window=button)

hint_button = tk.Button(root, text="Hint", command=show_hint)
canvas.create_window(map_width // 2 + 200, 20, window=hint_button)

root.mainloop()


