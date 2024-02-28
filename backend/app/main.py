# high level app config
from fastapi import FastAPI
from pydantic import BaseModel

# environment variables
from dotenv import load_dotenv
import os

# fastapi utils
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utils.tasks import repeat_every

#nba api
from nba_api.stats.endpoints import commonallplayers
from nba_api.stats.endpoints import playercareerstats
import pandas as pd

# Load .env file
load_dotenv()

app = FastAPI()

# define placeholder for the daily challenge
daily_challenge = []

# load CORS origins and configure middleware
origins = os.getenv("CORS_ORIGINS", ["https://dailydime.tinu.tech"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Player(BaseModel):
    id: int
    name: str
    ppg: float | None = None
    team_id: int
    team_abbreviation: str

@app.on_event("startup")
@repeat_every(seconds=60)
def regenerate_daily_challenge():
    global daily_challenge

    print("Regenerating daily challenge...")
    # get all active nba players
    players = commonallplayers.CommonAllPlayers(is_only_current_season = 1).get_data_frames()[0]
    # from all the player id's pick 5 random players
    selected_players = players[['PERSON_ID', 'DISPLAY_FIRST_LAST', 'TEAM_ID', 'TEAM_ABBREVIATION']].sample(5)

    data = []

    for p in selected_players.values:
        # get player all time stats
        player_stats = playercareerstats.PlayerCareerStats(player_id=p[0], per_mode36="Totals").get_data_frames()[0]
        # calculate career ppg by summing all the points and dividing by the number of games
        ppg = round(player_stats['PTS'].sum() / player_stats['GP'].sum(), 1)
        #print(f"{p[1]} has a career ppg of {ppg}")
        data.append({
            "id": p[0],
            "name": p[1],
            "ppg": ppg,
            "team_id": p[2],
            "team_abbreviation": p[3]
        })

    daily_challenge = data
    print("Daily challenge regenerated!")


@app.get("/daily-challenge")
def get_daily_challenge() -> list[Player]:
    return daily_challenge