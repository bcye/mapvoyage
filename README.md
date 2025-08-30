# Mapvoyage

I'm building a mobile travel guide that lets you view and plan with Wikivoyage (a crowdsourced travel guide by Wikimedia) on a map. With it, you can bookmark sights, restaurants you plan to visit and see them and their descriptions side by side with a map for easy orientation and navigation.

If this sounds exciting, you can:
- [Join our travel community](https://chat.mapvoyage.app) to discuss this project and travel in general
- Email me to discuss the project and how you can help (be it ideas, feedback, design, code or otherwise) at hello at mapvoyage dot app
- **[Download the alpha version](https://alpha.mapvoyage.app)** of the app and try it out

## Screenshots
<img width="200"  alt="overview" src="https://github.com/user-attachments/assets/ad1bd375-3d5f-4211-b7e8-51d62debd038" />
<img width="200"  alt="understand" src="https://github.com/user-attachments/assets/36fc6540-a407-4108-a5c7-83f934dea8a4" />
<img width="200"  alt="see" src="https://github.com/user-attachments/assets/2a462e2e-9d6a-4a44-b84e-8b192b102b5d" />
<img width="200"  alt="search" src="https://github.com/user-attachments/assets/daa0df0d-682e-4d28-ae27-f922be5d962c" />


## Tech Stack
Is not yet set in stone, but mainly:
* React Native (targeting iOS, Android and later web)
* tRPC if a backend is necessary
* Maptiler for OSM Maps and Geocoding
* Raw wikitext is precompiled to JSON and served statically from a CDN, see [bcye/structured-wikivoyage-exports](https://github.com/bcye/structured-wikivoyage-exports)

## Supporters
### SPH
[![ETH Student Project House](https://github.com/user-attachments/assets/ba5974d7-8f50-4cfe-b082-53ebc93a3e4a)](https://sph.ethz.ch)

### BrowserStack
This project is tested with BrowserStack