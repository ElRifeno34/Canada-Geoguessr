"""Canada GeoGuessr: desktop (Tkinter) version.

Type the name of a Canadian city; if it is on the list, it is pinned on the map
and a fun fact is shown. Wrong or repeated guesses cost a life.
"""

import csv
import random
import tkinter as tk
import unicodedata
from pathlib import Path
from tkinter import messagebox

from PIL import Image, ImageTk

HERE = Path(__file__).resolve().parent
MAP_PATH = HERE / "canada-map.png"
COORDS_PATH = HERE / "city_coordinates.csv"

MAP_SIZE = (1200, 900)
MAX_LIVES = 5

# Hints and facts are kept in sync with web/src/lib/cities.ts.
CITY_INFO = {
    "Toronto": ("This city is home to the CN Tower.", "Toronto is the largest city in Canada."),
    "Montreal": ("Known for its French heritage and its famous Jazz Festival.", "Montreal is the second largest French-speaking city in the world."),
    "Vancouver": ("Hosted the 2010 Winter Olympics.", "Vancouver is surrounded by mountains and ocean."),
    "Calgary": ("Famous for the Stampede, a huge annual rodeo.", "Calgary is a gateway to the Rocky Mountains."),
    "Ottawa": ("Canada's capital city, home to Parliament Hill.", "Ottawa hosts the Canadian Tulip Festival every spring."),
    "Québec City": ("The only walled city north of Mexico.", "Founded in 1608, Québec City is one of North America's oldest cities."),
    "Victoria": ("Capital of British Columbia, on the southern tip of Vancouver Island.", "Its Butchart Gardens draw around a million visitors each year."),
    "Edmonton": ("Capital of Alberta, on the North Saskatchewan River.", "It is home to West Edmonton Mall, once the largest mall in the world."),
    "Winnipeg": ("Capital of Manitoba, where the Red and Assiniboine rivers meet at The Forks.", "Winnie-the-Pooh was named after a bear from this city."),
    "Regina": ("Capital of Saskatchewan and home of the RCMP training academy.", "It was originally called Pile o' Bones."),
    "Saskatoon": ("Saskatchewan's largest city, nicknamed the 'City of Bridges'.", "It is named after a sweet purple berry native to the prairies."),
    "Halifax": ("Capital of Nova Scotia, with a famous star-shaped Citadel.", "Many Titanic victims are buried in this city's cemeteries."),
    "Fredericton": ("Capital of New Brunswick, on the Saint John River.", "It is nicknamed the 'City of Stately Elms'."),
    "Gaspé": ("At the tip of a Québec peninsula, where Jacques Cartier landed in 1534.", "Its name comes from a Mi'kmaq word meaning 'land's end'."),
    "Yellowknife": ("Capital of the Northwest Territories, on Great Slave Lake.", "It is one of the best places on Earth to see the northern lights."),
    "Whitehorse": ("Capital of Yukon, a hub of the Klondike Gold Rush era.", "It is named after rapids that looked like the manes of white horses."),
    "Iqaluit": ("Capital of Nunavut, on Baffin Island.", "It is the only Canadian territorial capital not connected by road to any other community."),
    "Kuujjuaq": ("The largest Inuit village in Nunavik, northern Québec.", "Its name means 'great river' in Inuktitut."),
}

ALIASES = {"quebec": "Québec City", "montréal": "Montreal"}


def normalize(text):
    """Lowercase, trim, collapse spaces and strip accents."""
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return " ".join(text.lower().split())


def load_cities(path):
    """Return {city name: (x, y)} with x and y as fractions of the map size."""
    with open(path, newline="", encoding="utf-8") as f:
        return {
            row["city"]: (float(row["x"].replace(",", ".")), float(row["y"].replace(",", ".")))
            for row in csv.DictReader(f, delimiter=";")
        }


class Game:
    def __init__(self, root):
        self.root = root
        self.cities = load_cities(COORDS_PATH)
        self.lookup = {normalize(name): name for name in self.cities}
        self.lookup.update({normalize(alias): name for alias, name in ALIASES.items()})
        self.found = []
        self.lives = MAX_LIVES

        root.title("Canada GeoGuessr")

        map_frame = tk.Frame(root)
        map_frame.pack(side="left")
        info_frame = tk.Frame(root, width=300)
        info_frame.pack(side="right", fill="y")

        self.map_img = ImageTk.PhotoImage(Image.open(MAP_PATH).resize(MAP_SIZE, Image.LANCZOS))
        self.width, self.height = MAP_SIZE
        self.canvas = tk.Canvas(map_frame, width=self.width, height=self.height)
        self.canvas.create_image(0, 0, anchor="nw", image=self.map_img)
        self.canvas.pack()

        self.status = tk.Label(info_frame, font=("Arial", 12))
        self.status.pack(pady=5)
        tk.Label(info_frame, text="Discovered cities", font=("Arial", 14, "bold")).pack(pady=5)
        self.info_text = tk.Text(info_frame, wrap="word", width=40, height=40)
        self.info_text.pack(padx=5, pady=5)

        self.entry = tk.Entry(root, font=("Arial", 14))
        self.entry.bind("<Return>", lambda _: self.check_answer())
        self.canvas.create_window(self.width // 2, 20, window=self.entry)
        guess_button = tk.Button(root, text="Guess", command=self.check_answer)
        self.canvas.create_window(self.width // 2 + 140, 20, window=guess_button)
        hint_button = tk.Button(root, text="Hint", command=self.show_hint)
        self.canvas.create_window(self.width // 2 + 200, 20, window=hint_button)

        self.update_status()
        self.entry.focus_set()

    def update_status(self):
        self.status.config(text=f"{len(self.found)} / {len(self.cities)} cities found  ·  Lives: {self.lives}")

    def check_answer(self):
        name = self.lookup.get(normalize(self.entry.get()))
        self.entry.delete(0, tk.END)

        if name and name not in self.found:
            self.found.append(name)
            self.pin(name)
            self.info_text.insert(tk.END, f"\n{name}: {CITY_INFO[name][1]}\n")
            self.update_status()
            if len(self.found) == len(self.cities):
                messagebox.showinfo("Congrats!", "You found all the cities!")
            return

        self.lives -= 1
        self.update_status()
        if self.lives <= 0:
            messagebox.showerror("Game Over", "You ran out of lives!")
            self.root.destroy()
        else:
            messagebox.showwarning("Wrong!", f"Wrong guess! {self.lives} lives left.")

    def pin(self, name):
        x, y = self.cities[name]
        x, y = x * self.width, y * self.height
        r = 6
        self.canvas.create_oval(x - r, y - r, x + r, y + r, fill="black", outline="white", width=2)
        self.canvas.create_text(x + 15, y + 11, text=name, font=("Arial", 10, "bold"), fill="black")

    def show_hint(self):
        remaining = [c for c in self.cities if c not in self.found]
        if not remaining:
            messagebox.showinfo("Hint", "No more cities left!")
            return
        messagebox.showinfo("Hint", f"Hint for one city:\n{CITY_INFO[random.choice(remaining)][0]}")


if __name__ == "__main__":
    root = tk.Tk()
    Game(root)
    root.mainloop()
