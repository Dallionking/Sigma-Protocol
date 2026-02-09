import { Tutor, AvailabilitySlot } from "@/stores/scheduleStore";

export const MOCK_TUTOR: Tutor = {
  id: "tutor_001",
  name: "AI Tutor",
  avatar: "tutor", // Will use TutorAvatar component
  bio: "Your friendly AI tutor specializing in personalized learning.",
  rating: 4.9,
};

export const OTHER_TUTORS: Tutor[] = [
  {
    id: "sofia_001",
    name: "Sofia",
    avatar: "https://i.pravatar.cc/150?u=sofia",
    bio: "Expert instructor with 5 years of teaching experience.",
    rating: 4.8,
  },
  {
    id: "carlos_001",
    name: "Carlos",
    avatar: "https://i.pravatar.cc/150?u=carlos",
    bio: "Subject matter expert focused on advanced techniques.",
    rating: 5.0,
  },
];

export function generateMockSlots(date: Date): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const hours = [9, 10, 11, 14, 15, 16, 17, 18, 19, 20];
  
  hours.forEach(hour => {
    // 00 slot
    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(30);
    
    slots.push({
      id: `slot_${startTime.getTime()}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isAvailable: Math.random() > 0.3,
    });

    // 30 slot
    const startTime30 = new Date(date);
    startTime30.setHours(hour, 30, 0, 0);
    const endTime30 = new Date(startTime30);
    endTime30.setMinutes(60);

    slots.push({
      id: `slot_${startTime30.getTime()}`,
      startTime: startTime30.toISOString(),
      endTime: endTime30.toISOString(),
      isAvailable: Math.random() > 0.3,
    });
  });

  return slots;
}

