import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, ChevronDown, Calendar, Search } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { clientRepository } from "../../../Repository/clientRepository";
import {
  countryRepository,
  CountryCode,
} from "../../../Repository/countryRepository";
import { colors } from "../../../Constants/colors";
import { AddClientStyles } from "./AddClientStyles";
import DateModal from "../../../Components/DateModal";
import { useAuthStore } from "../../../Store/useAuthStore";

interface AddClientScreenProps {
  onClientAdded?: () => void;
  route?: {
    params?: {
      prefilledData?: {
        name?: string;
        phone?: string;
      };
      onClientAdded?: () => void;
    };
  };
}

const AddClientScreen: React.FC<AddClientScreenProps> = ({
  route,
  onClientAdded,
}) => {
  const navigation = useNavigation();
  const prefilledData = route?.params?.prefilledData;
  const routeOnClientAdded = route?.params?.onClientAdded;

  // Parse prefilled name if provided
  const parseName = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  };

  const initialName = prefilledData?.name
    ? parseName(prefilledData.name)
    : { firstName: "", lastName: "" };

  const [firstName, setFirstName] = useState(initialName.firstName);
  const [lastName, setLastName] = useState(initialName.lastName);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(prefilledData?.phone || "");
  const [countryCode, setCountryCode] = useState("+971");
  const [selectedCountry, setSelectedCountry] = useState(
    "United Arab Emirates"
  );
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [showCountryCodeModal, setShowCountryCodeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [filteredCountryCodes, setFilteredCountryCodes] = useState<
    CountryCode[]
  >([]);
  const [countrySearchText, setCountrySearchText] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const { allLocations } = useAuthStore();

  useEffect(() => {
    fetchCountryCodes();
  }, []);

  const fetchCountryCodes = async () => {
    setLoadingCountries(true);
    try {
      const codes = await countryRepository.getCountryCodes();
      setCountryCodes(codes);
      setFilteredCountryCodes(codes);

      // Set default country
      const defaultCountry = codes.find((c) => c.code === "+971");
      if (defaultCountry) {
        setSelectedCountry(defaultCountry.country);
      }
    } catch (error) {
      console.error("Error fetching country codes:", error);
      // Use default codes if fetch fails
      const defaultCodes = countryRepository.getDefaultCountryCodes();
      setCountryCodes(defaultCodes);
      setFilteredCountryCodes(defaultCodes);
    } finally {
      setLoadingCountries(false);
    }
  };

  const handleCountrySearch = (text: string) => {
    setCountrySearchText(text);
    if (text.trim() === "") {
      setFilteredCountryCodes(countryCodes);
    } else {
      const filtered = countryCodes.filter(
        (cc) =>
          cc.country.toLowerCase().includes(text.toLowerCase()) ||
          cc.code.includes(text)
      );
      setFilteredCountryCodes(filtered);
    }
  };

  const selectCountryCode = (country: CountryCode) => {
    setCountryCode(country.code);
    setSelectedCountry(country.country);
    setShowCountryCodeModal(false);
    setCountrySearchText("");
    setFilteredCountryCodes(countryCodes);
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!location) newErrors.location = "Location is required";

    // Email validation (optional but must be valid if provided)
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const clientData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: `${countryCode}${phone.trim()}`,
        date_of_birth: dateOfBirth?.toISOString().split("T")[0] || null,
        notes: notes.trim(),
        location_id: location,
      };

      const result = await clientRepository.createClient(clientData);

      if (result) {
        // Use callback from route params if available, otherwise use prop
        (routeOnClientAdded || onClientAdded)?.();
        navigation.goBack();
      } else {
        setErrors({ general: "Failed to save client. Please try again." });
      }
    } catch (error) {
      console.error("Error saving client:", error);
      setErrors({ general: "An error occurred while saving the client." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={AddClientStyles.container}>
      <View style={AddClientStyles.header}>
        <Text style={AddClientStyles.headerTitle}>Add a new client</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={AddClientStyles.closeButton}
        >
          <X size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={AddClientStyles.scrollView}>
        <View style={AddClientStyles.content}>
          {/* General Error Message */}
          {errors.general && (
            <View style={AddClientStyles.generalErrorContainer}>
              <Text style={AddClientStyles.generalErrorText}>
                {errors.general}
              </Text>
            </View>
          )}
          {/* Name Section */}
          <View style={AddClientStyles.row}>
            <View style={AddClientStyles.halfWidth}>
              <Text style={AddClientStyles.label}>First Name *</Text>
              <TextInput
                style={[
                  AddClientStyles.input,
                  errors.firstName && AddClientStyles.inputError,
                ]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.firstName && (
                <Text style={AddClientStyles.errorText}>
                  {errors.firstName}
                </Text>
              )}
            </View>

            <View style={AddClientStyles.halfWidth}>
              <Text style={AddClientStyles.label}>Last Name</Text>
              <TextInput
                style={[
                  AddClientStyles.input,
                  errors.lastName && AddClientStyles.inputError,
                ]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor={colors.textSecondary}
              />
              {errors.lastName && (
                <Text style={AddClientStyles.errorText}>{errors.lastName}</Text>
              )}
            </View>
          </View>

          {/* Phone Number */}
          <View style={AddClientStyles.section}>
            <Text style={AddClientStyles.label}>Phone Number *</Text>
            <View style={AddClientStyles.phoneContainer}>
              <TouchableOpacity
                style={AddClientStyles.countryCodeButton}
                onPress={() => setShowCountryCodeModal(true)}
              >
                <View>
                  <Text style={AddClientStyles.countryCodeText}>
                    {countryCode}
                  </Text>
                  <Text style={AddClientStyles.countryNameText}>
                    {selectedCountry.substring(0, 10)}...
                  </Text>
                </View>
                <ChevronDown size={16} color={colors.text} />
              </TouchableOpacity>
              <TextInput
                style={[
                  AddClientStyles.phoneInput,
                  errors.phone && AddClientStyles.inputError,
                ]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && (
              <Text style={AddClientStyles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {/* Email */}
          <View style={AddClientStyles.section}>
            <Text style={AddClientStyles.label}>Email</Text>
            <TextInput
              style={[
                AddClientStyles.input,
                errors.email && AddClientStyles.inputError,
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={AddClientStyles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={AddClientStyles.section}>
            <Text style={AddClientStyles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={AddClientStyles.dateButton}
              onPress={() => setShowDateModal(true)}
            >
              <Text
                style={[
                  AddClientStyles.dateButtonText,
                  !dateOfBirth && AddClientStyles.placeholderText,
                ]}
              >
                {dateOfBirth
                  ? dateOfBirth.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select date of birth"}
              </Text>
              <Calendar size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={AddClientStyles.section}>
            <Text style={AddClientStyles.label}>Notes</Text>
            <TextInput
              style={[AddClientStyles.input, AddClientStyles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any notes about the client"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Location */}
          <View style={AddClientStyles.section}>
            <Text style={AddClientStyles.label}>Location *</Text>
            <TouchableOpacity
              style={[
                AddClientStyles.dropdownButton,
                errors.location && AddClientStyles.inputError,
              ]}
              onPress={() => setShowLocationModal(true)}
            >
              <Text
                style={[
                  AddClientStyles.dropdownButtonText,
                  !location && AddClientStyles.placeholderText,
                ]}
              >
                {location
                  ? allLocations.find((loc) => loc.id === location)?.name ||
                    "Select location"
                  : "Select location"}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {errors.location && (
              <Text style={AddClientStyles.errorText}>{errors.location}</Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              AddClientStyles.saveButton,
              isSaving && AddClientStyles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={AddClientStyles.saveButtonText}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Code Modal */}
      <Modal
        visible={showCountryCodeModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCountryCodeModal(false);
          setCountrySearchText("");
          setFilteredCountryCodes(countryCodes);
          Keyboard.dismiss();
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowCountryCodeModal(false);
            setCountrySearchText("");
            setFilteredCountryCodes(countryCodes);
            Keyboard.dismiss();
          }}
        >
          <View style={AddClientStyles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={AddClientStyles.modalContent}
              >
                {/* Modal Drag Indicator */}
                <View style={AddClientStyles.modalDragIndicator} />
                <Text style={AddClientStyles.modalTitle}>
                  Select Country Code
                </Text>

                {/* Search Bar */}
                <View style={AddClientStyles.searchContainer}>
                  <Search size={20} color={colors.textSecondary} />
                  <TextInput
                    style={AddClientStyles.searchInput}
                    placeholder="Search country or code..."
                    value={countrySearchText}
                    onChangeText={handleCountrySearch}
                    autoCapitalize="none"
                  />
                </View>

                {loadingCountries ? (
                  <View style={AddClientStyles.loadingContainer}>
                    <Text>Loading countries...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredCountryCodes}
                    keyExtractor={(item) => item.id}
                    style={AddClientStyles.countryList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={AddClientStyles.modalItem}
                        onPress={() => selectCountryCode(item)}
                      >
                        <Text style={AddClientStyles.modalItemText}>
                          {item.country} ({item.code})
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={AddClientStyles.emptyContainer}>
                        <Text style={AddClientStyles.emptyText}>
                          No countries found
                        </Text>
                      </View>
                    }
                  />
                )}

                <TouchableOpacity
                  style={AddClientStyles.modalCloseButton}
                  onPress={() => {
                    setShowCountryCodeModal(false);
                    setCountrySearchText("");
                    setFilteredCountryCodes(countryCodes);
                  }}
                >
                  <Text style={AddClientStyles.modalCloseButtonText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={AddClientStyles.modalOverlay}>
          <View style={AddClientStyles.modalContent}>
            <Text style={AddClientStyles.modalTitle}>Select Location</Text>
            {allLocations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={AddClientStyles.modalItem}
                onPress={() => {
                  setLocation(loc.id);
                  setShowLocationModal(false);
                }}
              >
                <Text style={AddClientStyles.modalItemText}>{loc.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={AddClientStyles.modalCloseButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={AddClientStyles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DateModal
        isVisible={showDateModal}
        onClose={() => setShowDateModal(false)}
        onSelectDate={(date) => setDateOfBirth(date)}
        selectedDate={dateOfBirth || undefined}
        title="Select Date of Birth"
        maxDate={new Date().toISOString().split("T")[0]}
      />
    </SafeAreaView>
  );
};

export default AddClientScreen;
