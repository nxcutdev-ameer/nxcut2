import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { use } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReportDetailsScreenStyles } from "./ReportDetailsScreenStyles";
import {
  ArrowLeft,
  ChartCandlestick,
  CircleX,
  FileText,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react-native";
import ReportsScreenStyles from "../ReportsScreen/ReportsScreenStyles";
import { TextInput } from "react-native-gesture-handler";
import colors from "../../../Constants/colors";
import useReportDetailsScreenVM from "./ReportDetailsScreenVM";
import ReportCard from "../../../Components/ReportCart";
import { useNavigation } from "@react-navigation/native";
import { fontEq, getWidthEquivalent } from "../../../Utils/helpers";
import CustomToast from "../../../Components/CustomToast";
import { useToast } from "../../../Hooks/useToast";

const ReportsDetailsScreen = () => {
  const navigation = useNavigation();
  const { toast, showComingSoon, hideToast } = useToast();

  const {
    tabs,
    activeTab,
    clearSearchText,
    searchText,
    setSearchText,
    onFilterPress,
    onTabPress,
    reportsOptions,
  } = useReportDetailsScreenVM();
  return (
    <SafeAreaView style={ReportDetailsScreenStyles.mainContainer}>
      <View style={ReportDetailsScreenStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={ReportDetailsScreenStyles.backButton}
        >
          <ArrowLeft size={20} color={colors.colors.black} />
          <Text
            style={{
              fontSize: fontEq(16),
              color: colors.colors.black,
              fontWeight: "500",
              marginLeft: getWidthEquivalent(5),
            }}
          >
            Back
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={ReportDetailsScreenStyles.headerButton}>
          <Text style={ReportDetailsScreenStyles.headerButtonText}>Add</Text>
          <Plus size={24} />
        </TouchableOpacity> */}
      </View>
      <ScrollView>
        <View style={ReportDetailsScreenStyles.badgeHeaderContianer}>
          <Text style={ReportDetailsScreenStyles.headerText}>
            Reporting and analytics
          </Text>
          {/* <View style={ReportDetailsScreenStyles.badgeContainer}></View> */}
          <Text style={ReportDetailsScreenStyles.subTextBadge}>
            Access all of your Nxcut Reports
          </Text>
        </View>

        <View style={ReportDetailsScreenStyles.searchFilterContainer}>
          <View style={ReportDetailsScreenStyles.searchContainer}>
            <View style={ReportDetailsScreenStyles.searchIcon}>
              <Search size={24} />
            </View>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by report name or description"
              style={ReportDetailsScreenStyles.searchInput}
            />
            <View style={ReportDetailsScreenStyles.clearSearchContainer}>
              {searchText.length > 0 && (
                <TouchableOpacity
                  style={ReportDetailsScreenStyles.clearSearch}
                  onPress={clearSearchText}
                  hitSlop={30}
                >
                  <CircleX size={18} color={colors.colors.borderFocus} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* <TouchableOpacity
            onPress={showComingSoon}
            style={ReportDetailsScreenStyles.filterContainer}
          >
            <ChartCandlestick size={26} strokeWidth={1.5} />
          </TouchableOpacity> */}
        </View>
        <ScrollView
          contentContainerStyle={ReportDetailsScreenStyles.tabsContainer}
          showsHorizontalScrollIndicator={false}
          horizontal
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              onPress={() => {
                onTabPress(tab.id);
              }}
              key={tab.id}
              style={[
                ReportDetailsScreenStyles.tab,
                activeTab === tab.id && ReportDetailsScreenStyles.activeTab,
              ]}
            >
              <Text
                style={[
                  ReportDetailsScreenStyles.tabText,
                  activeTab === tab.id &&
                    ReportDetailsScreenStyles.activeTabText,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Report Cards */}
        <View style={ReportDetailsScreenStyles.listContainer}>
          {(() => {
            const filteredReports = reportsOptions.filter((report) => {
              // First filter by tab selection
              let showByTab = true;
              if (activeTab !== 0) {
                // If activeTab is not 0 (All reports), filter by tab
                const selectedTab = tabs.find((tab) => tab.id === activeTab);
                showByTab = selectedTab
                  ? report.type === selectedTab.title
                  : true;
              }

              // Then filter by search text (only if search text has 3+ characters)
              let showBySearch = true;
              if (searchText.length >= 3) {
                showBySearch = report.title
                  .toLowerCase()
                  .includes(searchText.toLowerCase());
              }

              return showByTab && showBySearch;
            });

            // Show search empty state when searching returns no results
            if (filteredReports.length === 0 && searchText.length >= 3) {
              return (
                <View style={ReportDetailsScreenStyles.emptyStateContainer}>
                  <Search
                    size={48}
                    color={colors.colors.textSecondary}
                    strokeWidth={1}
                  />
                  <Text style={ReportDetailsScreenStyles.emptyStateTitle}>
                    No reports found
                  </Text>
                  <Text style={ReportDetailsScreenStyles.emptyStateSubtitle}>
                    No reports match "{searchText}". Try a different search
                    term.
                  </Text>
                </View>
              );
            }

            // Show empty tab state when tab has no reports (without search)
            if (filteredReports.length === 0 && searchText.length < 3) {
              const selectedTab = tabs.find((tab) => tab.id === activeTab);
              const tabName = selectedTab?.title || "reports";

              return (
                <View style={ReportDetailsScreenStyles.emptyTabStateContainer}>
                  <View style={ReportDetailsScreenStyles.emptyTabIconContainer}>
                    <FileText size={64} color={colors.colors.textSecondary} strokeWidth={1} />
                  </View>
                  <Text style={ReportDetailsScreenStyles.emptyTabTitle}>
                    No {tabName.toLowerCase()} available
                  </Text>
                  <Text style={ReportDetailsScreenStyles.emptyTabSubtitle}>
                    {activeTab === 0
                      ? "No reports have been created yet. Reports will appear here once they're available."
                      : `There are currently no ${tabName.toLowerCase()} reports available. Check back later or try a different category.`
                    }
                  </Text>
                  {/* <View style={ReportDetailsScreenStyles.comingSoonBadge}>
                    <Text style={ReportDetailsScreenStyles.comingSoonText}>
                      Coming Soon
                    </Text>
                  </View> */}
                </View>
              );
            }

            return filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                type={report.type}
                title={report.title}
                description={report.description}
                icon={report.icon}
                isFavourite={report.isFavourite}
                onPress={report.onPress}
              />
            ));
          })()}
        </View>
      </ScrollView>

      <CustomToast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

export default ReportsDetailsScreen;
