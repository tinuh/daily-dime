from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Player(BaseModel):
    id: int
    name: str
    ppg: float | None = None
    team_id: int
    team_abbreviation: str

@app.get("/daily-challenge")
def get_daily_challenge() -> list[Player]:
    players = [
        Player(id=203095, name="Evan Fournier", ppg=14.1, team_id=1610612765, team_abbreviation="DET"),
        Player(id=1627751, name="Jakob Poeltl", ppg=8.8, team_id=1610612761, team_abbreviation="TOR"),
        Player(id=1631197, name="Jared Rhoden", ppg=3.0, team_id=1610612765, team_abbreviation="DET"),
        Player(id=1628378, name="Donovan Mitchell", ppg=25.0, team_id=1610612739, team_abbreviation="CLE"),
        Player(id=1641731, name="Bilal Coulibaly", ppg=8.3, team_id=1610612764, team_abbreviation="WAS")
    ]

    return players