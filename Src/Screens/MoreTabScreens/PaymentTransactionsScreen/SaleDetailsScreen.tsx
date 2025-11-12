import { StyleSheet, Text, View } from "react-native";
import React, { FC, use, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { paymentRepository } from "../../../Repository/paymentsRepository";
import { useReportStore } from "../../../Store/useReportsStore";

interface SaleDetailsScreenProps {
  route: any;
}
const SaleDetailsScreen: FC<SaleDetailsScreenProps> = ({ route }) => {
  const { sale_id } = route.params;
  const navigation = useNavigation();
  const { saleDetails, fetchSaleDetials } = useReportStore();
  useEffect(() => {
    const fetchSale = async () => {
      try {
        const data = await fetchSaleDetials(sale_id);
        console.log("data from screen", data);
      } catch (err: any) {
        console.log("err form screen", err);
      }
    };

    fetchSale();
  }, []);

  return (
    <View style={{ padding: 16 }}>
      {/* <Text style={{ fontWeight: "bold" }}>
        Appointment ID: {saleDetails}
      </Text>
      <Text>Status: {saleDetails.status}</Text>
      <Text>Appointment Date: {saleDetails.appointment_date}</Text>

      <Text style={{ marginTop: 12, fontWeight: "bold" }}>Services:</Text>
      {saleDetails.appointment_services?.map((serviceItem: any) => (
        <View key={serviceItem.id} style={{ marginVertical: 4 }}>
          <Text>Service: {serviceItem.service?.name}</Text>
          <Text>Staff: {serviceItem.staff?.first_name}</Text>
          <Text>Price: {serviceItem.price}</Text>
        </View>
      ))} */}
    </View>
  );
};

export default SaleDetailsScreen;

const styles = StyleSheet.create({});
