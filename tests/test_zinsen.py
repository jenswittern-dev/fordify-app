"""Unit Tests für Verzugszinsberechnung."""
import pytest
from decimal import Decimal
from datetime import date

from core.zinsen import (
    berechne_verzugszinsen,
    aktueller_basiszinssatz,
    tageszins,
)

# Minimaler Test-Datensatz Basiszinssätze (verifiziert gegen Bundesbank, 31.03.2026)
# 2022-07-01 blieb bei -0.88% (keine Änderung zum 01.07.2022)
BASISATZ_TEST = [
    {"gueltig_ab": date(2022, 1, 1), "satz": Decimal("-0.88")},
    {"gueltig_ab": date(2022, 7, 1), "satz": Decimal("-0.88")},
    {"gueltig_ab": date(2023, 1, 1), "satz": Decimal("1.62")},
    {"gueltig_ab": date(2023, 7, 1), "satz": Decimal("3.12")},
    {"gueltig_ab": date(2024, 1, 1), "satz": Decimal("3.62")},
    {"gueltig_ab": date(2024, 7, 1), "satz": Decimal("3.37")},
    {"gueltig_ab": date(2025, 1, 1), "satz": Decimal("2.27")},
]


class TestAktuellerBasiszinssatz:
    def test_exakt_am_stichtag(self):
        # 01.07.2022: kein Wechsel, bleibt bei -0.88%
        satz = aktueller_basiszinssatz(date(2022, 7, 1), BASISATZ_TEST)
        assert satz == Decimal("-0.88")
        # 01.07.2023: Wechsel auf 3.12%
        satz2 = aktueller_basiszinssatz(date(2023, 7, 1), BASISATZ_TEST)
        assert satz2 == Decimal("3.12")

    def test_tag_vor_wechsel(self):
        satz = aktueller_basiszinssatz(date(2022, 6, 30), BASISATZ_TEST)
        assert satz == Decimal("-0.88")

    def test_mitte_periode(self):
        satz = aktueller_basiszinssatz(date(2023, 3, 15), BASISATZ_TEST)
        assert satz == Decimal("1.62")

    def test_kein_satz_vor_beginn(self):
        with pytest.raises(ValueError):
            aktueller_basiszinssatz(date(2020, 1, 1), BASISATZ_TEST)


class TestBerechneVerzugszinsen:
    def test_einzelperiode_ohne_wechsel(self):
        """Einfache Berechnung innerhalb einer Periode."""
        betrag = Decimal("10000.00")
        # 01.02.2023 bis 28.02.2023 = 28 Tage, Basiszins 1.62%, Aufschlag 9%
        perioden = berechne_verzugszinsen(
            betrag=betrag,
            von=date(2023, 2, 1),
            bis=date(2023, 2, 28),
            aufschlag_pp=9,
            basiszinssaetze=BASISATZ_TEST,
        )
        assert len(perioden) == 1
        p = perioden[0]
        assert p.basiszinssatz == Decimal("1.62")
        assert p.zinssatz == Decimal("10.62")
        assert p.tage == 28
        # Erwarteter Betrag: 10000 * 10.62 / 100 * 28 / 365 = 81.47...
        erwarteter = (Decimal("10000") * Decimal("10.62") / 100 * 28 / 365).quantize(Decimal("0.01"))
        assert p.zinsbetrag == erwarteter

    def test_periodeuebergang_01_07(self):
        """Berechnung über Basiszinssatz-Wechsel am 01.07.2023 (3.12% → ab H2 2023)."""
        betrag = Decimal("10000.00")
        # 15.06.2023 bis 15.07.2023: Wechsel am 01.07.2023 von 1.62% auf 3.12%
        perioden = berechne_verzugszinsen(
            betrag=betrag,
            von=date(2023, 6, 15),
            bis=date(2023, 7, 15),
            aufschlag_pp=9,
            basiszinssaetze=BASISATZ_TEST,
        )
        assert len(perioden) == 2
        # Erste Periode: 15.06. bis 30.06. = 16 Tage mit 1.62% Basis
        assert perioden[0].von == date(2023, 6, 15)
        assert perioden[0].bis == date(2023, 6, 30)
        assert perioden[0].tage == 16
        assert perioden[0].basiszinssatz == Decimal("1.62")
        # Zweite Periode: 01.07. bis 15.07. = 15 Tage mit 3.12% Basis
        assert perioden[1].von == date(2023, 7, 1)
        assert perioden[1].bis == date(2023, 7, 15)
        assert perioden[1].tage == 15
        assert perioden[1].basiszinssatz == Decimal("3.12")

    def test_kein_periodeuebergang_2022(self):
        """Sonderfall: 01.07.2022 – kein Wechsel (Rate blieb bei -0.88%)."""
        betrag = Decimal("10000.00")
        perioden = berechne_verzugszinsen(
            betrag=betrag,
            von=date(2022, 6, 15),
            bis=date(2022, 7, 15),
            aufschlag_pp=9,
            basiszinssaetze=BASISATZ_TEST,
        )
        # Kein Wechsel → wird zu EINER Periode zusammengeführt
        # (da beide Perioden denselben Basiszins haben, bleibt es ggf. bei 2 Einträgen
        # oder 1 – je nach Implementierung; wichtig: Zinssatz ist überall 8.12%)
        for p in perioden:
            assert p.basiszinssatz == Decimal("-0.88")
            assert p.zinssatz == Decimal("8.12")

    def test_inso_kuerzt_zeitraum(self):
        """InsO-Datum kappt Zinslauf."""
        betrag = Decimal("5000.00")
        perioden = berechne_verzugszinsen(
            betrag=betrag,
            von=date(2023, 1, 1),
            bis=date(2023, 12, 31),
            aufschlag_pp=9,
            inso_datum=date(2023, 3, 15),
            basiszinssaetze=BASISATZ_TEST,
        )
        # Alle Perioden müssen vor oder am 15.03.2023 enden
        for p in perioden:
            assert p.bis <= date(2023, 3, 15)

    def test_von_nach_bis_ergibt_leere_liste(self):
        """Wenn von > bis, leere Liste."""
        perioden = berechne_verzugszinsen(
            betrag=Decimal("1000.00"),
            von=date(2023, 6, 1),
            bis=date(2023, 5, 1),
            aufschlag_pp=9,
            basiszinssaetze=BASISATZ_TEST,
        )
        assert perioden == []

    def test_verbraucher_aufschlag_5(self):
        """Verbraucher: Aufschlag 5 Prozentpunkte."""
        perioden = berechne_verzugszinsen(
            betrag=Decimal("1000.00"),
            von=date(2023, 2, 1),
            bis=date(2023, 2, 28),
            aufschlag_pp=5,
            basiszinssaetze=BASISATZ_TEST,
        )
        assert perioden[0].zinssatz == Decimal("6.62")  # 1.62 + 5

    def test_einzeltag(self):
        """Ein Tag Zinsen."""
        perioden = berechne_verzugszinsen(
            betrag=Decimal("24466.00"),
            von=date(2023, 1, 1),
            bis=date(2023, 1, 1),
            aufschlag_pp=9,
            basiszinssaetze=BASISATZ_TEST,
        )
        assert len(perioden) == 1
        assert perioden[0].tage == 1


class TestTageszins:
    def test_tageszins_berechnung(self):
        """Tageszins für 24.466 EUR, Aufschlag 9%, Basiszins 2.27%."""
        tz = tageszins(
            betrag=Decimal("24466.00"),
            aufschlag_pp=9,
            stichtag=date(2025, 1, 15),
            basiszinssaetze=BASISATZ_TEST,
        )
        # 24466 * 11.27 / 100 / 365 ≈ 7.54...
        assert tz > Decimal("0")
        assert tz < Decimal("10")  # Plausibilitätsprüfung
