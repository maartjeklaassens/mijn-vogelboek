# Mijn Vogelboek — eerste werkende versie

Een mobielvriendelijke webapp voor een persoonlijke vogellevenslijst. Geen framework of bouwstap nodig; de app gebruikt ES-modules en een optionele Supabase-client.

## Snel proberen

Open vanuit deze map een terminal en voer uit:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080 . In de **lokale proefstand** kun je soorten afvinken, datum/locatie toevoegen, eigen foto's opslaan (maximaal 2 MB per foto in je browser), zoeken, filteren, statistieken bekijken en een JSON-back-up downloaden/importeren. Deze gegevens staan in de browser; ze synchroniseren NIET naar andere apparaten. Maak vóór het aansluiten van de cloud een back-up. Browseropslag is niet bedoeld als definitieve opslag van veel foto's.

## Online account en synchronisatie aanzetten

1. Maak een eigen project aan op https://supabase.com/dashboard .
2. Open de SQL Editor en voer `supabase.sql` uit. Dit creëert de `observations` tabel met per-gebruiker toegangsbeleid en de privé-bucket `bird-photos`.
3. Ga in Supabase naar Project Settings / API Keys. Kopieer uitsluitend de **Project URL** en de **publishable key** (of legacy anon key), NOOIT een secret of service_role key.
4. Ga in Mijn Vogelboek naar **Instellingen**, vul de URL en key in, klik op Verbinding opslaan.
5. Maak een account aan met e-mailadres/wachtwoord. Bevestig je e-mailadres als Supabase dat verlangt. Log in.
6. Vanaf dat moment worden afgevinkte soorten en nieuwe foto's online opgeslagen, met Row Level Security. Foto's worden uit een privé-bucket opgehaald met tijdelijke signed URLs.
7. Om de app op twee apparaten te gebruiken moet je deze website hosten (bijvoorbeeld Netlify, GitHub Pages of Cloudflare Pages), de URL op elk apparaat openen en inloggen met hetzelfde account. De URL/key moeten bij deze versie eenmaal per browser in Instellingen worden ingevuld.

**Let op:** Data die je in de lokale proefstand invoerde wordt niet automatisch gemigreerd naar de cloud. De ingebouwde JSON-back-up is daarvoor nog geen automatische cloud-import. Maak zo nodig je vinkjes opnieuw na koppeling. Cloud-waarnemingen worden opgehaald bij het inloggen en na herladen; realtime push naar een reeds geopend tabblad is nog niet geïmplementeerd. Foto's verwijderen/vervangen ruimt oude bestanden nog niet automatisch op in Storage.

## Soortenlijst

De meegeleverde `species.js` bevat een **handmatig samengestelde selectie**, NIET de volledige officieel gecontroleerde Nederlandse lijst. De app laat dat ook zien. Je kunt een CSV met kolommen `name,scientific,group` (optioneel `emoji`) importeren in Instellingen. Vinkjes worden gekoppeld op basis van de wetenschappelijke naam (slug). Externe taxonomische wijzigingen vragen dus om een migratieplan. De geïmporteerde catalogus wordt momenteel per browser opgeslagen en synchroniseert nog niet tussen apparaten; de waarnemingen wél.

Bij een officiële lijst kun je bijvoorbeeld beginnen bij https://www.dutchavifauna.nl/ — controleer altijd hergebruik-/downloadrechten en de actuele taxonomie. Wij hebben niet zomaar een ongeautoriseerde bron gescrapet.

## Aanbevelingen en kaart

De pagina Ontdekken toont functionele lijsten met nog ongeziene soorten en geziene soorten zonder foto. Een rangschikking op trefkans binnen 25 km van de **stad Groningen** in **deze week** is nog niet actief. Hiervoor moet een toegestane actuele waarnemingsfeed met datum, soort en geolocatie beschikbaar zijn; deze app verzint geen waarschijnlijkheid. Ook de kaart is nog niet actief: ingevoerde locaties zijn momenteel vrije tekst, zonder coördinaten.

## Privacy en beperkingen

De cloudmodus is een basisimplementatie, geen afgerond veiligheidsaudit. De SQL-bucket is privé met eigenaargebonden paden. Deel je Supabase service key nooit. Bij cloudverbinding moet internet beschikbaar zijn om de Supabase clientmodule van `esm.sh` te laden. Upload ondersteunt maximaal 8 MB en een geldige image MIME-type. De stat 'Dit jaar' telt alleen waarnemingen met ingevulde datum in dat kalenderjaar.

## Bestanden

- `index.html` — vormgeving en HTML
- `app.js` — interface, lokale opslag, authenticatie, foto-upload en cloud CRUD
- `species.js` — transparant gelabelde voorbeeldsoorten
- `supabase.sql` — database, privéopslag en beveiligingsbeleid
