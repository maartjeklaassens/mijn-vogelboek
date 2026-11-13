# Mijn Vogelboek – herstel van 8 exacte naamkoppelingen

Analyse van `vogelboek-stickercontrole.json` (553 soorten, 18 zonder kandidaat).

## Aangepast en met een gesimuleerde index getest
- Korhoen: Tetrao tetrix → Lyrurus tetrix
- Dwergaalscholver: Microcarbo pygmeus → Microcarbo pygmaeus
- Morinelplevier: Charadrius morinellus → Eudromias morinellus
- Kleine Plevier: Charadrius dubius → Thinornis dubius
- Steenuil: Athene vidalii → Athene noctua
- Middelste Bonte Specht: Dendropicos medius → Dendrocoptes medius
- Roodmus: Erythrina erythrina → Carpodacus erythrinus
- Bruinkopdiksnavelmees: Sinosuthora webbiana → Suthora webbiana

Deze aanpassingen veranderen alleen het opzoeken van stickers, niet je `species.js`, Supabase-tabellen of waarnemingen.

## Nog nader te verifiëren: geen vervangers toepassen
- Thayers Meeuw (Larus thayeri): mogelijk als taxon bij Larus glaucoides; niet zomaar die soortsticker gebruiken.
- Steppeklapekster (Lanius lahtora): complex taxonomisch concept; soortconcept vergelijken.
- Strandleeuwerik (Eremophila flava): betreft Eremophila alpestris flava; alleen specifieke vormsticker als beschikbaar.
- Siberische Tjiftjaf (Phylloscopus tristis): ondersoort van P. collybita in sommige lijsten; geen standaard Tjiftjaf-sticker gebruiken.
- Engelse, Noordse, Witkeel- en Balkankwikstaart (Motacilla flavissima, thunbergi, cinereocapilla, feldegg): vormen van de Gele Kwikstaart; uitsluitend eigen ondersoortsticker.
- Rouwkwikstaart (Motacilla yarrellii): vorm van Motacilla alba; uitsluitend eigen ondersoortsticker.
- Kleinste Canadese Gans (Branta hutchinsii minima): uitsluitend eigen ondersoortsticker.

## Ook nog onopgelost: afbeeldingen die niet laden
Witbuikrotgans, Zwarte Rotgans, Humes Braamsluiper en Witstuitbarmsijs kregen volgens eerdere console-uitvoer een kandidaat die niet geladen werd. Hiervoor zijn daadwerkelijke bestanden of werkende precieze paden nodig, niet alleen naamkoppelingen.

## Validatiegrens
Codecontrole en gesimuleerde resolvertest geslaagd. Live bereikbaarheid van alle afbeeldingen is niet geverifieerd. Daarom wordt dit pakket niet als volledige oplossing voor 553/553 gepresenteerd.
