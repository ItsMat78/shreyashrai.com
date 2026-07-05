---
title: Lagrange-Lock
blurb: "A research project dedicated to solving the station-keeping problem for satellites at Lagrange Points (specifically Earth-Moon L1) using Deep Reinforcement Learning."
outcome: "Taming the Three-Body Problem with Reinforcement Learning"
tech: ["Python", "Reinforcement learning", "Gymnasium", "Numba", "Three.js"]
order: 1
cover: /images/lagrange-lock.png
headerArt: /header/Satellite.png
live: https://lagrange-lock.shreyashrai.com
source: https://github.com/ItsMat78/Lagrange-Lock
---
## Teaching an AI to Surf Gravity at Lagrange Point L1

**Lagrange-Lock** is a research project where I trained an AI to keep a satellite stable at the Earth-Moon L1 Lagrange point using **Deep Reinforcement Learning**, specifically a Proximal Policy Optimization (PPO) agent

Instead of relying on traditional control theory (which needs heavy mathematical linearization and perfect models), the AI learns to navigate the chaotic gravitational environment of the **Circular Restricted Three-Body Problem (CR3BP)** purely through trial and error.

**Live Demo**: [lagrange-lock.shreyashrai.com](https://lagrange-lock.shreyashrai.com)  
**Source Code**: [GitHub](https://github.com/ItsMat78/Lagrange-Lock)

<figure >
<video src="https://github.com/user-attachments/assets/59efcec9-c9b7-4394-9ebe-5f78b20ba3dc" autoplay loop muted playsinline width="100%"></video>
<figcaption>A demonstration of the agent maintaining orbit near L1</figcaption>
</figure>

## What are Lagrange Points?
<figure class="img-right">
<a href="https://www.researchgate.net/figure/Lagrange-points-in-the-Earth-Moon-system-The-three-body-problem-In-1722-Leonard-Euler_fig2_333919347"><img src="https://www.researchgate.net/profile/Gustavo-Gargioni/publication/333919347/figure/fig2/AS:784941633781763@1564156077699/Lagrange-points-in-the-Earth-Moon-system-The-three-body-problem-In-1722-Leonard-Euler.ppm" alt="Lagrange points in the Earth-Moon system The three-body problem In 1722, Leonard Euler proved the existence of the collinear libration point. In 1765, Lagrange found the triangular libration point L4 and L5 [4, Fig. 2]. In 1899, Henri Poincaré proved that the restricted problem was unsolvable and analytic, differentiable function of both the initial conditions and the time. Solving this problem is infinitely complex because of its many nonlinear dynamical systems which still have no closed form solution [5]."/></a>
<figcaption>A diagram showing the five lagrange points.</figcaption>
</figure>

Lagrange Points (also called libration points) are five special locations in space where the gravitational pull of two large bodies (like Earth and the Moon) perfectly balances with the centrifugal force felt in their rotating frame. This creates spots where a small object, like a satellite, can stay in a relatively fixed position with very little fuel.

In the Earth-Moon system, L1 sits between Earth and the Moon, L2 is on the far side of the Moon, and L3 is on the opposite side of Earth. L4 and L5 form equilateral triangles with Earth and the Moon.

These points are incredibly useful for space missions because they offer stable vantage points for observing the Sun, Earth, or deep space while using minimal station-keeping fuel.

### Are they stable? 
Not all of them are equally stable:

- **L4 and L5** (the triangular points) are naturally stable. Objects placed there tend to stay nearby, orbiting in a "tadpole" or kidney-bean shaped path around the point.
- **L1, L2, and L3** (the collinear points) are **unstable**. They're like trying to balance a pencil on its tip, any small perturbation (a tiny push from gravity, solar radiation, or measurement error) will cause the satellite to drift away over time.

That's exactly why station-keeping is such a challenging problem at Earth-Moon L1. Satellites there need constant, smart corrections to avoid falling out of position. This instability is what makes this AI project particularly interesting.

### About real-life projects near Lagrange points
Lagrange points are already home to some of the most important space observatories:

- **Sun-Earth L1**: Home to SOHO (solar observation) and DSCOVR (space weather and Earth monitoring).
- **Sun-Earth L2**: Currently hosts the **James Webb Space Telescope (JWST)**, along with Gaia, Euclid, and future missions like the Nancy Grace Roman Space Telescope. L2 is perfect for astronomy because the Sun, Earth, and Moon stay behind the spacecraft, allowing excellent thermal shielding and clear views of deep space.
- **Earth-Moon L2**: China's Queqiao relay satellite operates here to communicate with the Chang’e-4 mission on the Moon’s far side.
- **Future missions**: More are planned, including ESA’s Vigil mission at L5 for improved space weather prediction.

These missions rely on careful orbit design (often Halo or Lissajous orbits) and regular station-keeping maneuvers.

## What I Built & Achieved

- Built a high-performance physics simulator (ported to **Numba**) that runs ~**10,000 simulation steps per second**.
- Trained a reinforcement learning agent that successfully maintains a **Halo orbit** for over **5,000 timesteps** after ~5 million training episodes.
- Created a full-stack experience: a custom Gymnasium environment connected to a real-time **Three.js** WebGL visualization so anyone can watch the AI in action.

### The Challenge


<figure class="img-right">
<img src="/images/lagrange-lock.png" alt="Taxshila App">
<figsub>Pure gravitational physics simulated in browser</figsub>
</figure>


Lagrange points are special spots in space where gravitational forces balance out, making them ideal for satellites. But they're also unstable, especially L1. Tiny errors grow quickly, and satellites naturally drift away. Traditional solutions require complex math and precise modeling. I wanted to see if an AI could learn to "surf" these gravitational manifolds without hand-crafted equations.

### How It Works

The project evolved through clear phases:

**Phase 1: Physics Foundations**  
Implemented the full CR3BP equations, found the exact location of L1, and validated energy conservation (Jacobi Constant).

**Phase 2: 3D Physics Engine**  
Moved to full 3D, built a custom RK4 integrator, and created an interactive Three.js visualizer to watch objects move in the Earth-Moon system.

**Phase 3: The AI Pilot (Mostly Complete)**  
- Ported the physics to blazing-fast Numba code.  
- Designed a custom Gymnasium environment with a smart reward function balancing stability, fuel efficiency, and orbit quality.  
- Trained a PPO agent using Stable-Baselines3.  
- Connected everything to the web frontend so you can request AI-controlled trajectories in real time.

The agent now reliably finds and holds Halo orbits, which is pretty cool to watch.

**Phase 4 (Next)**: Adding real-world messiness, sensor noise, thruster failures, and transfer orbits from Earth.

### Tech Stack

- **AI/ML**: Python, Stable-Baselines3 (PPO), Gymnasium  
- **Performance**: NumPy, Numba (JIT), SciPy  
- **Visualization**: Three.js + WebGL

### Training Journey

<div class="figure-row">
  <figure>
    <img src="/images/training_rewards.png" alt="Training Reward over Episodes" width="1000" height="500">
    <figcaption>The left plot shows the agent going from crashing almost instantly to maintaining long-term orbits.</figcaption>
  </figure>
  <figure>
    <img src="/images/training_distance.png" alt="Distance to L1 vs Time" width="1000" height="500">
    <figcaption>The right plot proves it’s genuinely getting better at staying near L1 over millions of timesteps.</figcaption>
  </figure>
</div>


## Have other people done what I have?
Yes and no.

Station-keeping at Lagrange points using traditional control methods (like PID controllers or optimal control) has been done successfully for decades. However, using **Deep Reinforcement Learning** (especially PPO) to train an end-to-end "Blind Pilot" AI for this problem in the full CR3BP dynamics is still quite novel and rare.

There is growing academic research applying Reinforcement Learning to orbital station-keeping and cislunar operations (including some work on Halo orbits and NRHOs in the Earth-Moon system), but most projects remain in simulation or early research stages. My project stands out by combining a high-performance Numba physics engine, a full Gymnasium environment, real-time Three.js visualization, and successfully training an agent that maintains long-duration Halo orbits.

It’s an exciting space where AI meets astrodynamics, and I’m happy to be contributing to it!

## Credits
Name|Organisation
|:---|---:|
Shreyash Rai (Author) | *IIIT Naya Raipur, 2026 (IV Semester)*  
Sameer Choudhary (Co-author) | *IIIT Naya Raipur, 2026 (IV Semester)*  
Dr. Avantika Singh (Supervisor) | *IIIT Naya Raipur*