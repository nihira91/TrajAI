# DISHA 🛰️
### Deep Intelligence for Satellite and Heavenly-body Anticipation

A full-stack satellite trajectory prediction and collision detection system powered by a deep LSTM neural network trained on 32 million orbital sequences.

---

## Overview

DISHA uses a 3-layer LSTM model to predict satellite positions up to 50 timesteps into the future, visualized on an interactive 3D globe with real-time collision threat detection.

| Metric | Value |
|--------|-------|
| Training sequences | 32,347,210 |
| Satellites tracked | ~18,000 |
| Model MAE | **22.58 km** |
| Model RMSE | **31.95 km** |
| Improvement over baseline | **75%** |
| GPU | NVIDIA Tesla T4 ×2 |

---

## Demo

> 🚧 Live demo coming soon

![DISHA Dashboard](docs/dashboard.png)

---

## Features

- **3D Earth Globe** — interactive, rotatable globe with real satellite orbital tracks
- **Real-time Animation** — play/pause/scrub through predicted trajectories
- **3 Trajectory Types** — actual historical track, model prediction (5 steps), future projection (50 steps)
- **Collision Detection** — real-time pairwise distance computation across all satellites
- **Threat Classification** — Critical (<100 km), Warning (<300 km), Watch (<600 km)
- **Satellite Search & Filter** — filter by orbit type (LEO/MEO/GEO) or threat status
- **Satellite Info Drawer** — click any satellite for ECI coordinates, altitude, lat/lng
- **Threat Analysis Panel** — full ranked list of all active close-approach pairs

---

## Architecture

### ML Pipeline (Python / Kaggle)

```
Raw Parquet Data (30 days, 5-min intervals)
        ↓
Feature Engineering
  • Position (x, y, z km)
  • Velocity (vx, vy, vz km/s)
  • Orbital radius (km)
        ↓
MinMaxScaler (3 separate scalers)
        ↓
Sliding Window Sequences
  • Input  : 40 timesteps × 7 features  (200 min history)
  • Output :  5 timesteps × 3 features  (25 min prediction)
        ↓
TFRecord Shards (647 files, 85/15 train/val split)
        ↓
LSTM Model Training
        ↓
predictions.json export
```

### Model Architecture

```
Input (40, 7)
    │
LSTM(128, return_sequences=True)
    │
LSTM(128, return_sequences=True)
    │
LSTM(64,  return_sequences=False)
    │
Dense(256, relu)
    │
Dense(15)  →  Reshape(5, 3)
    │
Output (5, 3) — next 5 positions (x, y, z)
```

### Frontend Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| 3D Rendering | Three.js + @react-three/fiber |
| Globe helpers | @react-three/drei |
| Styling | CSS-in-JS (no framework) |
| Font | JetBrains Mono |

---

## Project Structure

```
TrajAI/
├── frontend/
│   ├── public/
│   │   └── predictions.json          # exported model predictions
│   ├── src/
│   │   ├── components/
│   │   │   ├── Globe.jsx             # 3D Earth + satellite tracks
│   │   │   ├── SatellitePanel.jsx    # sidebar — search + filter
│   │   │   ├── CollisionAlert.jsx    # threat alert cards
│   │   │   ├── InfoDrawer.jsx        # satellite detail panel
│   │   │   ├── StatsBar.jsx          # top stats bar
│   │   │   └── PlaybackControls.jsx  # play/pause/scrub
│   │   ├── hooks/
│   │   │   ├── useSatelliteData.js   # loads predictions.json
│   │   │   ├── useCollisions.js      # pairwise distance computation
│   │   │   └── useAnimation.js       # requestAnimationFrame loop
│   │   ├── utils/
│   │   │   ├── coords.js             # ECI → Three.js conversion
│   │   │   ├── collision.js          # distance + risk thresholds
│   │   │   └── colors.js             # color palette
│   │   ├── threats/
│   │   │   └── ThreatPanel.jsx       # full threat analysis panel
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/TrajAI.git
cd TrajAI/frontend

# Install dependencies
npm install

# Add predictions data
# Place predictions.json in frontend/public/

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for production

```bash
npm run build
npm run preview
```

---

## Dataset

- **Source**: Synthetic satellite ephemeris data
- **Resolution**: 5-minute intervals
- **Duration**: 30 days
- **Satellites**: ~18,000
- **Features**: position (x, y, z km), velocity (vx, vy, vz km/s)
- **Total records**: ~32M sequences after sliding window extraction

---

## Training

Training was done on Kaggle with NVIDIA Tesla T4 ×2 GPU.

| Parameter | Value |
|-----------|-------|
| Input sequence length | 40 steps (200 min) |
| Prediction horizon | 5 steps (25 min) |
| Batch size | 128 |
| Steps per epoch | 8,000 |
| Max epochs | 30 |
| Optimizer | Adam (lr=1e-3) |
| Loss | MSE |
| Early stopping patience | 5 epochs |

Training converged at epoch 19 (first run) + continued to epoch 10 (second run) via checkpoint resume.

---

## Collision Detection

Threats are computed every animation frame across all displayed satellites:

| Level | Distance Threshold | Color |
|-------|-------------------|-------|
| CRITICAL | < 100 km | 🔴 Red |
| WARNING | < 300 km | 🟠 Amber |
| WATCH | < 600 km | 🟡 Yellow |

---

## Roadmap

- [ ] Backend FastAPI server for live inference
- [ ] Full 18,000 satellite dataset in frontend
- [ ] Earth night-side texture
- [ ] Satellite name lookup (NORAD catalog)
- [ ] Export collision report as PDF
- [ ] Deploy to Vercel

---

## License

MIT

---

<div align="center">
  Built with Python · TensorFlow · React · Three.js
</div>
