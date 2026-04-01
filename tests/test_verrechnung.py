"""Unit Tests für Zahlungsverrechnung §§ 366, 367 BGB."""
from decimal import Decimal
from datetime import date

from core.models import Position, Aktionstyp, Kategorie
from core.verrechnung import berechne_verrechnung


def _pos(nr, typ, umsatz, datum=None, manuelle_zuweisung=None) -> Position:
    p = Position(
        id=str(nr),
        pos_nr=nr,
        aktionstyp=typ,
        umsatz=Decimal(str(umsatz)),
        bu_datum=datum or date(2024, 1, nr),
        ist_zahlung=(typ == Aktionstyp.ZAHLUNG),
        manuelle_zuweisung=manuelle_zuweisung,
    )
    return p


class TestBerechneVerrechnung:
    def test_zahlung_deckt_nur_zinsen(self):
        """Zahlung reicht nur für Zinsen, Hauptforderung bleibt offen."""
        positionen = [
            _pos(1, Aktionstyp.HAUPTFORDERUNG, "1000.00"),
            _pos(2, Aktionstyp.ZINSPERIODE, "50.00"),
            _pos(3, Aktionstyp.ZAHLUNG, "-50.00", datum=date(2024, 1, 10)),
        ]
        ergebnis = berechne_verrechnung(positionen)

        # Zinsen sollten vollständig verrechnet sein
        zinsen_posten = [p for p in ergebnis.posten if p.kategorie == Kategorie.ZINSEN_HAUPTSACHE]
        assert zinsen_posten[0].offen == Decimal("0.00")

        # Hauptforderung bleibt
        hf_posten = [p for p in ergebnis.posten if p.kategorie == Kategorie.HAUPTFORDERUNG]
        assert hf_posten[0].offen == Decimal("1000.00")

    def test_zahlung_deckt_alles(self):
        """Zahlung deckt Zinsen und Hauptforderung vollständig."""
        positionen = [
            _pos(1, Aktionstyp.HAUPTFORDERUNG, "1000.00"),
            _pos(2, Aktionstyp.ZINSPERIODE, "50.00"),
            _pos(3, Aktionstyp.ZAHLUNG, "-1050.00", datum=date(2024, 1, 10)),
        ]
        ergebnis = berechne_verrechnung(positionen)
        for posten_item in ergebnis.posten:
            assert posten_item.offen == Decimal("0.00")

    def test_ueberzahlung(self):
        """Zahlung übersteigt die Forderung → Restzahlung bleibt unverrechnet."""
        positionen = [
            _pos(1, Aktionstyp.HAUPTFORDERUNG, "500.00"),
            _pos(2, Aktionstyp.ZAHLUNG, "-600.00", datum=date(2024, 1, 5)),
        ]
        ergebnis = berechne_verrechnung(positionen)
        hf = [p for p in ergebnis.posten if p.kategorie == Kategorie.HAUPTFORDERUNG]
        assert hf[0].offen == Decimal("0.00")
        # Protokoll zeigt Restbetrag 100 nach Verrechnung
        assert ergebnis.zahlungen_verrechnet[0]["rest_nach_verrechnung"] == Decimal("100.00")

    def test_reihenfolge_zinsen_vor_kosten(self):
        """Zinsen werden vor Kosten verrechnet."""
        positionen = [
            _pos(1, Aktionstyp.HAUPTFORDERUNG, "1000.00"),
            _pos(2, Aktionstyp.ZINSPERIODE, "100.00"),
            _pos(3, Aktionstyp.GV_KOSTEN, "50.00"),
            # Zahlung reicht nur für Zinsen + Hälfte der Kosten
            _pos(4, Aktionstyp.ZAHLUNG, "-125.00", datum=date(2024, 1, 10)),
        ]
        ergebnis = berechne_verrechnung(positionen)
        zinsen = [p for p in ergebnis.posten if p.kategorie == Kategorie.ZINSEN_HAUPTSACHE]
        kosten = [p for p in ergebnis.posten if p.kategorie == Kategorie.UNVERZINSLICHE_KOSTEN]

        # Zinsen vollständig verrechnet
        assert zinsen[0].offen == Decimal("0.00")
        # Kosten teilweise verrechnet: 25 EUR offen
        assert kosten[0].offen == Decimal("25.00")

    def test_manuelle_zuweisung(self):
        """Manuelle Zuweisung überschreibt Automatik."""
        positionen = [
            _pos(1, Aktionstyp.HAUPTFORDERUNG, "1000.00"),
            _pos(2, Aktionstyp.ZINSPERIODE, "100.00"),
            # Zahlung wird manuell auf Hauptforderung zugewiesen (nicht auf Zinsen)
            _pos(3, Aktionstyp.ZAHLUNG, "-200.00",
                 datum=date(2024, 1, 10),
                 manuelle_zuweisung={"1": Decimal("200.00")}),
        ]
        ergebnis = berechne_verrechnung(positionen)
        hf = [p for p in ergebnis.posten if p.kategorie == Kategorie.HAUPTFORDERUNG]
        zinsen = [p for p in ergebnis.posten if p.kategorie == Kategorie.ZINSEN_HAUPTSACHE]

        # Hauptforderung wurde reduziert
        assert hf[0].offen == Decimal("800.00")
        # Zinsen unberührt
        assert zinsen[0].offen == Decimal("100.00")

    def test_zwei_zahlungen_chronologisch(self):
        """Zwei Zahlungen werden in korrekter Reihenfolge verarbeitet."""
        positionen = [
            _pos(1, Aktionstyp.HAUPTFORDERUNG, "1000.00"),
            _pos(2, Aktionstyp.ZINSPERIODE, "100.00"),
            # Erste Zahlung: 2. Januar
            _pos(3, Aktionstyp.ZAHLUNG, "-100.00", datum=date(2024, 1, 2)),
            # Zweite Zahlung: 15. Januar
            _pos(4, Aktionstyp.ZAHLUNG, "-500.00", datum=date(2024, 1, 15)),
        ]
        ergebnis = berechne_verrechnung(positionen)
        # Nach beiden Zahlungen: 600 verrechnet
        hf = [p for p in ergebnis.posten if p.kategorie == Kategorie.HAUPTFORDERUNG]
        zinsen = [p for p in ergebnis.posten if p.kategorie == Kategorie.ZINSEN_HAUPTSACHE]
        assert zinsen[0].offen == Decimal("0.00")
        assert hf[0].offen == Decimal("500.00")
