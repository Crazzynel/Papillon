import { useTheme } from "@react-navigation/native";
import { FileWarningIcon } from "lucide-react-native"; // Icône pour "Vie Scolaire"
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import { useAttendanceStore } from "@/stores/attendance"; // Utilisation du AttendanceStore pour les absences et retards

// Composant "Vie Scolaire"
const VieScolaireWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);

  // Accès aux données de présences et aux périodes depuis le store
  const attendances = useAttendanceStore((store) => store.attendances);
  const defaultPeriod = useAttendanceStore((store) => store.defaultPeriod);

  // Expose la méthode handlePress au parent via ref
  useImperativeHandle(ref, () => ({
    handlePress: () => "Attendances"
  }));

  // Utilisation de useMemo pour calculer les heures non justifiées
  const unjustifiedHours = useMemo(() => {
    let totalMinutes = 0;

    const periodAttendance = attendances[defaultPeriod] || { absences: [], delays: [] };

    // Calcul des absences non justifiées
    periodAttendance.absences.forEach((absence) => {
      if (!absence.justified) {
        const fromTimestamp = absence.fromTimestamp;
        const toTimestamp = absence.toTimestamp;
        const duration = (toTimestamp - fromTimestamp) / 60 / 1000; // Conversion en minutes
        totalMinutes += duration;
      }
    });

    // Calcul des retards non justifiés
    periodAttendance.delays.forEach((delay) => {
      if (!delay.justified) {
        totalMinutes += delay.duration;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h${minutes < 10 ? "0" : ""}${minutes}`; // Formatage en "XhXX"
  }, [attendances, defaultPeriod]);

  // Effet pour cacher le widget si aucune heure n'est à afficher
  {/*}
  useEffect(() => {
    setHidden(!unjustifiedHours || unjustifiedHours === "0h00");
  }, [unjustifiedHours]);
*/}
  return (
    <>
      {/* Titre du widget */}
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <FileWarningIcon size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Vie Scolaire
        </Text>
      </View>

      {/* Affichage principal : Heures non justifiées */}
      <Reanimated.View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginTop: "auto",
          width: "100%",
        }}
        layout={LinearTransition}
      >
        {/* Affichage des heures en grand */}
        <Text
          style={{
            fontSize: 40, // Taille très grande pour l'heure
            color: colors.text,
            fontFamily: "bold",
          }}
        >
          {unjustifiedHours}
        </Text>

        {/* Cadre rouge avec le texte "Heures Injustifiées" */}
        <View
          style={{
            backgroundColor: "red",
            borderRadius: 4,
            paddingVertical: 4,
            paddingHorizontal: 10,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "semibold",
              fontSize: 12,
            }}
          >
            Heures Injustifiées
          </Text>
        </View>
      </Reanimated.View>
    </>
  );
});

export default VieScolaireWidget;
