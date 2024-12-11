import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useDataStore } from "../../store/data";
import { api } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../constants/colors";
import { Data } from "../../types/data";
import { Link, router } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";

interface ResponseData {
  data: Data;
}

export default function Nutrition() {
  const user = useDataStore((state) => state.user);
  const [storedDiet, setStoredDiet] = useState<Data | null>(null);

  // Function to save diet to AsyncStorage
  const saveDietToStorage = async (dietData: Data) => {
    try {
      await AsyncStorage.setItem("savedDiet", JSON.stringify(dietData));
    } catch (error) {
      console.error("Error saving diet to storage", error);
    }
  };

  // Function to load diet from AsyncStorage
  const loadDietFromStorage = async () => {
    try {
      const savedDiet = await AsyncStorage.getItem("savedDiet");
      if (savedDiet) {
        setStoredDiet(JSON.parse(savedDiet));
      }
    } catch (error) {
      console.error("Error loading diet from storage", error);
    }
  };

  // Query to fetch diet data
  const { data, isFetching, error } = useQuery({
    queryKey: ["nutrition"],
    queryFn: async () => {
      try {
        if (!user) {
          throw new Error("Failed to load nutrition");
        }

        const response = await api.post<ResponseData>("/create", {
          name: user.name,
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          objective: user.objective,
          level: user.level,
        });

        // Save the newly fetched diet to storage
        await saveDietToStorage(response.data.data);

        return response.data.data;
      } catch (err) {
        console.log(err);
      }
    },
  });

  // Load saved diet on component mount
  useEffect(() => {
    loadDietFromStorage();
  }, []);

  // Determine which diet data to use
  const displayData = data || storedDiet;

  async function handleShare() {
    try {
      if (!displayData || Object.keys(displayData).length === 0) return;

      const supplements = displayData.suplementos
        .map((item) => item)
        .join(", ");

      const foods = displayData.refeicoes
        .map(
          (item) =>
            `\n- Nome: ${item.nome}\n- Horário: ${
              item.horario
            }\n- Alimentos: ${item.alimentos.join(", ")}`
        )
        .join("\n");

      const message = `Dieta: ${displayData.nome} - Objetivo: ${displayData.objetivo}\n\n${foods}\n\n- Dica Suplemento: ${supplements}`;

      await Share.share({
        message: message,
      });
    } catch (err) {
      console.log(err);
    }
  }

  // Clear saved diet
  const handleClearDiet = async () => {
    try {
      await AsyncStorage.removeItem("savedDiet");
      setStoredDiet(null);
      router.replace("/");
    } catch (error) {
      console.error("Error clearing diet", error);
    }
  };

  if (isFetching && !storedDiet) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Estamos gerando sua dieta!</Text>
        <Text style={styles.loadingText}>Consultando IA...</Text>
      </View>
    );
  }

  if (error && !storedDiet) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Falha ao gerar dieta!</Text>
        <Link href="/">
          <Text style={styles.loadingText}>Tente novamente</Text>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerHeader}>
        <View style={styles.contentHeader}>
          <Text style={styles.title}>Minha dieta</Text>

          <Pressable style={styles.buttonShare} onPress={handleShare}>
            <Text style={styles.buttonShareText}>Compartilhar</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ paddingLeft: 16, paddingRight: 16, flex: 1 }}>
        {displayData && Object.keys(displayData).length > 0 && (
          <>
            <Text style={styles.name}>Nome: {displayData.nome}</Text>
            <Text style={styles.objective}>Foco: {displayData.objetivo}</Text>

            <Text style={styles.label}>Refeições:</Text>
            <ScrollView>
              <View style={styles.foods}>
                {displayData.refeicoes.map((refeicao) => (
                  <View key={refeicao.nome} style={styles.food}>
                    <View style={styles.foodHeader}>
                      <Text style={styles.foodName}>{refeicao.nome}</Text>
                      <Ionicons name="restaurant" size={16} color="#000" />
                    </View>

                    <View style={styles.foodContent}>
                      <Feather name="clock" size={14} color="#000" />
                      <Text>Horário: {refeicao.horario}</Text>
                    </View>

                    <Text style={styles.foodText}>Alimentos:</Text>
                    {refeicao.alimentos.map((alimento) => (
                      <Text key={alimento}>{alimento}</Text>
                    ))}
                  </View>
                ))}
              </View>

              <View style={styles.supplements}>
                <Text style={styles.foodName}>Dica suplementos:</Text>
                {displayData.suplementos.map((item) => (
                  <Text key={item}>{item}</Text>
                ))}
              </View>

              <Pressable style={styles.button} onPress={handleClearDiet}>
                <Text style={styles.buttonText}>Gerar nova dieta</Text>
              </Pressable>
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: colors.white,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  containerHeader: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 16,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 16,
  },
  title: {
    fontSize: 28,
    color: colors.background,
    fontWeight: "bold",
  },
  buttonShare: {
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 4,
  },
  buttonShareText: {
    color: colors.white,
    fontWeight: "500",
  },
  name: {
    fontSize: 20,
    color: colors.white,
    fontWeight: "bold",
  },
  objective: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 24,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  foods: {
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  food: {
    backgroundColor: "rgba(208, 208, 208, 0.40)",
    padding: 8,
    borderRadius: 4,
  },
  foodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  foodContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  foodText: {
    fontSize: 16,
    marginBottom: 4,
    marginTop: 14,
  },
  supplements: {
    backgroundColor: colors.white,
    marginTop: 14,
    marginBottom: 14,
    padding: 14,
    borderRadius: 8,
  },
  button: {
    backgroundColor: colors.blue,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
