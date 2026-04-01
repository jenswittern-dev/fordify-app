"""Unit Tests für RVG-Gebührenberechnung."""
import pytest
from decimal import Decimal

from core.rvg import gebuehr_aus_tabelle, berechne_rvg_position, berechne_rvg_gesamt

# Test-Tabelle mit verifizierten Werten (BGBl. 2025 I Nr. 109, verifiziert 31.03.2026)
RVG_TABELLE_TEST = [
    {"bis":   500, "gebuehr": Decimal("51.50")},
    {"bis":  1000, "gebuehr": Decimal("93.00")},
    {"bis":  1500, "gebuehr": Decimal("134.50")},
    {"bis":  2000, "gebuehr": Decimal("176.00")},
    {"bis":  5000, "gebuehr": Decimal("354.50")},
    {"bis": 10000, "gebuehr": Decimal("652.00")},
    {"bis": 25000, "gebuehr": Decimal("927.00")},
    {"bis": 35000, "gebuehr": Decimal("1099.00")},
    {"bis": 500000, "gebuehr": Decimal("3752.00")},
]


class TestGebuehrAusTabelle:
    def test_exakt_an_grenze(self):
        assert gebuehr_aus_tabelle(Decimal("500"), RVG_TABELLE_TEST) == Decimal("51.50")
        assert gebuehr_aus_tabelle(Decimal("1000"), RVG_TABELLE_TEST) == Decimal("93.00")

    def test_innerhalb_stufe(self):
        """Streitwert 750 EUR fällt in Stufe bis 1.000 EUR."""
        assert gebuehr_aus_tabelle(Decimal("750"), RVG_TABELLE_TEST) == Decimal("93.00")

    def test_praxisbeispiel_24466(self):
        """Streitwert 24.466 EUR → Stufe bis 25.000 EUR = 927,00 EUR."""
        assert gebuehr_aus_tabelle(Decimal("24466.00"), RVG_TABELLE_TEST) == Decimal("927.00")

    def test_praxisbeispiel_34407(self):
        """Streitwert 34.407,68 EUR → Stufe bis 35.000 EUR = 1.099,00 EUR."""
        assert gebuehr_aus_tabelle(Decimal("34407.68"), RVG_TABELLE_TEST) == Decimal("1099.00")

    def test_ueber_tabellenmaximum(self):
        """Über 500.000 EUR: § 13 Abs. 2 Formel (108 EUR je angefangene 30.000 EUR)."""
        ergebnis = gebuehr_aus_tabelle(Decimal("530000"), RVG_TABELLE_TEST)
        assert ergebnis == Decimal("3752.00") + Decimal("108.00")
        ergebnis2 = gebuehr_aus_tabelle(Decimal("560000"), RVG_TABELLE_TEST)
        assert ergebnis2 == Decimal("3752.00") + Decimal("216.00")


class TestBerechneRVGPosition:
    def test_vv_2300_1_3_fach(self):
        """VV 2300, 1,3-fach, Streitwert 24.466 EUR → 927,00 × 1,3 = 1.205,10 EUR."""
        pos = berechne_rvg_position(Decimal("24466.00"), "2300", tabelle=RVG_TABELLE_TEST)
        assert pos.vv_nummer == "2300"
        assert pos.faktor == Decimal("1.3")
        assert pos.gebuehr_einfach == Decimal("927.00")
        assert pos.gebuehr_gesamt == Decimal("1205.10")

    def test_vv_3309_0_3_fach(self):
        """VV 3309, 0,3-fach, Streitwert 34.407,68 EUR → 1.099 × 0,3 = 329,70 EUR."""
        pos = berechne_rvg_position(Decimal("34407.68"), "3309", tabelle=RVG_TABELLE_TEST)
        assert pos.gebuehr_gesamt == Decimal("329.70")

    def test_vv_7002_unter_maximum(self):
        """VV 7002: 20% von kleiner Gebühr, unter 20 EUR."""
        # Nettogebühren 51,50 EUR → 20% = 10,30 EUR < 20,00 EUR
        pos = berechne_rvg_position(Decimal("51.50"), "7002", tabelle=RVG_TABELLE_TEST)
        assert pos.gebuehr_gesamt == Decimal("10.30")

    def test_vv_7002_maximum(self):
        """VV 7002: 20% übersteigt Maximum, wird auf 20 EUR gekappt."""
        pos = berechne_rvg_position(Decimal("1000.00"), "7002", tabelle=RVG_TABELLE_TEST)
        assert pos.gebuehr_gesamt == Decimal("20.00")

    def test_unbekannte_vv_nummer(self):
        with pytest.raises(ValueError):
            berechne_rvg_position(Decimal("5000.00"), "9999", tabelle=RVG_TABELLE_TEST)


class TestBerechneRVGGesamt:
    def test_vv_2300_plus_7002(self):
        """Streitwert 24.466 EUR, VV 2300 + 7002: 1.205,10 + 20,00 = 1.225,10 EUR."""
        positionen, netto, ust, gesamt = berechne_rvg_gesamt(
            Decimal("24466.00"), ["2300", "7002"], tabelle=RVG_TABELLE_TEST
        )
        assert netto == Decimal("1225.10")
        assert len(positionen) == 2

    def test_vv_3309_plus_7002(self):
        """Streitwert 34.407,68 EUR, VV 3309 + 7002: 329,70 + 20,00 = 349,70 EUR."""
        positionen, netto, ust, gesamt = berechne_rvg_gesamt(
            Decimal("34407.68"), ["3309", "7002"], tabelle=RVG_TABELLE_TEST
        )
        assert netto == Decimal("349.70")

    def test_ust_berechnung(self):
        """USt = 19% auf Netto, korrekt gerundet."""
        _, netto, ust, gesamt = berechne_rvg_gesamt(
            Decimal("5000.00"), ["2300"], tabelle=RVG_TABELLE_TEST
        )
        # 354.50 * 1.3 = 460.85, USt = 460.85 * 0.19 = 87.56 (gerundet)
        assert ust == (netto * Decimal("0.19")).quantize(Decimal("0.01"))
        assert gesamt == netto + ust
