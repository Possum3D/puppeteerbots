RATE LIMIT:
avoid multiple connexions to target during test phase;
use always the first connexion and its credentials (cookies)
make sure to not forget the session by running an infinite loop.
while true; do curl 'https://nouveau.europresse.com/Pdf/Edition?sourceCode=EC_P' -H 'Cookie: xyz' --compressed ;sleep 60 ;done


