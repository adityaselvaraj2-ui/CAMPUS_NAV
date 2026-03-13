import { useState, useCallback } from 'react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CampusMap from '@/components/CampusMap';
import Masterbar, { TabId } from '@/components/Masterbar';
import HelpDeskTab from '@/components/tabs/HelpDeskTab';
import EventsTab from '@/components/tabs/EventsTab';
import HeatmapTab from '@/components/tabs/HeatmapTab';
import OccupancyTab from '@/components/tabs/OccupancyTab';
import IndoorNavTab from '@/components/tabs/IndoorNavTab';
import FeedbackTab from '@/components/tabs/FeedbackTab';
import AdminTab from '@/components/tabs/AdminTab';
import { campuses } from '@/data/campusData';

const Index = () => {
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('navigate');

  const selectedCampus = campuses.find((c) => c.id === selectedCampusId);

  const handleSelectCampus = useCallback((campusId: string) => {
    setSelectedCampusId(campusId);
    setActiveTab('navigate');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCampusId(null);
  }, []);

  const renderTab = () => {
    if (!selectedCampus) return null;
    switch (activeTab) {
      case 'navigate':
        return <CampusMap campus={selectedCampus} onBack={handleBack} />;
      case 'helpdesk':
        return <HelpDeskTab />;
      case 'events':
        return <EventsTab />;
      case 'heatmap':
        return <HeatmapTab campus={selectedCampus} />;
      case 'occupancy':
        return <OccupancyTab campus={selectedCampus} />;
      case 'indoor':
        return <IndoorNavTab campus={selectedCampus} />;
      case 'feedback':
        return <FeedbackTab campus={selectedCampus} />;
      case 'admin':
        return <AdminTab />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <StarField />
      <Navbar />

      {!selectedCampus ? (
        <Hero onSelectCampus={handleSelectCampus} />
      ) : (
        <div className="pt-[70px]">
          <Masterbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            accentColor={selectedCampus.color}
          />
          {renderTab()}
        </div>
      )}
    </div>
  );
};

export default Index;
