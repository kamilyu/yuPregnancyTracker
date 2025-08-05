
export const milestones: Record<number, string> = {
    12: "First Trimester Complete! 🎉",
    20: "Halfway There! 🎊",
    24: "Viability Milestone Reached! 💪",
    28: "Third Trimester Begins! 🌟",
    36: "Baby is Full Term Soon! 👶"
};

export const dailyDevelopmentData = [
  // Week 1-3 are conception, not much data
  ...Array(21).fill({
    babySize: "Single Cell",
    developmentFact: "The journey from a single cell to a baby is just beginning. Fertilization and implantation are taking place.",
    pregnancyTip: "It's a good time to start taking prenatal vitamins, especially folic acid, if you haven't already.",
  }),
  // Week 4 (7 days)
  { week: 4, day: 1, babySize: "Poppy Seed", developmentFact: "The blastocyst has implanted in the uterine wall. The inner cells will become the embryo.", pregnancyTip: "You might get a positive result on a home pregnancy test this week!" },
  { week: 4, day: 2, babySize: "Poppy Seed", developmentFact: "The amniotic sac and yolk sac have formed. The yolk sac produces early blood cells.", pregnancyTip: "Calculate your estimated due date, usually 40 weeks from the first day of your last period." },
  { week: 4, day: 3, babySize: "Poppy Seed", developmentFact: "The embryo's three layers are forming: ectoderm, mesoderm, and endoderm.", pregnancyTip: "Avoid alcohol, smoking, and recreational drugs for the health of your baby." },
  { week: 4, day: 4, babySize: "Poppy Seed", developmentFact: "The ectoderm will develop into the nervous system, skin, and hair.", pregnancyTip: "Schedule your first prenatal appointment with an OB/GYN or midwife." },
  { week: 4, day: 5, babySize: "Poppy Seed", developmentFact: "The mesoderm will form the heart, circulatory system, bones, and muscles.", pregnancyTip: "Early pregnancy symptoms like fatigue and breast tenderness might begin." },
  { week: 4, day: 6, babySize: "Poppy Seed", developmentFact: "The endoderm will become the digestive system, liver, and lungs.", pregnancyTip: "Focus on a balanced diet rich in fruits, vegetables, and lean protein." },
  { week: 4, day: 7, babySize: "Poppy Seed", developmentFact: "The neural tube, which becomes the brain and spinal cord, is beginning to form.", pregnancyTip: "Stay hydrated by drinking plenty of water throughout the day." },
  // Week 5 (7 days)
  { week: 5, day: 1, babySize: "Apple Seed", developmentFact: "The heart is beginning to form and may even start to beat this week.", pregnancyTip: "Feeling nauseous? Try eating small, frequent meals to combat morning sickness." },
  { week: 5, day: 2, babySize: "Apple Seed", developmentFact: "The circulatory system is the first major system to function.", pregnancyTip: "Gentle exercise like walking is great, but check with your doctor first." },
  { week: 5, day: 3, babySize: "Apple Seed", developmentFact: "Arm and leg buds are starting to sprout.", pregnancyTip: "Rest when you can. Your body is working hard to grow a new life." },
  { week: 5, day: 4, babySize: "Apple Seed", developmentFact: "The brain and spinal cord are developing rapidly from the neural tube.", pregnancyTip: "Talk to your partner and loved ones about your feelings and excitement." },
  { week: 5, day: 5, babySize: "Apple Seed", developmentFact: "Basic facial features, like pits for eyes and nostrils, are marking their spots.", pregnancyTip: "Keep a journal to document this special journey." },
  { week: 5, day: 6, babySize: "Apple Seed", developmentFact: "The umbilical cord develops, connecting you and your baby.", pregnancyTip: "Research which foods to avoid during pregnancy, like certain soft cheeses and deli meats." },
  { week: 5, day: 7, babySize: "Apple Seed", developmentFact: "By the end of this week, your embryo is clearly visible on an ultrasound.", pregnancyTip: "It's still early, but start dreaming about your future with your little one!" },
    // Week 6 (7 days)
  { week: 6, day: 1, babySize: "Sweet Pea", developmentFact: "Your baby's heart is now beating at a regular rhythm, around 100-160 times per minute.", pregnancyTip: "Ginger tea or candies can help soothe an upset stomach." },
  { week: 6, day: 2, babySize: "Sweet Pea", developmentFact: "The nose, mouth, and ears are starting to take shape.", pregnancyTip: "Make sure your skincare products are pregnancy-safe." },
  { week: 6, day: 3, babySize: "Sweet Pea", developmentFact: "Webbed fingers and toes are forming on the limb buds.", pregnancyTip: "Your sense of smell might be heightened, which can trigger nausea. Avoid strong odors." },
  { week: 6, day: 4, babySize: "Sweet Pea", developmentFact: "Lungs are in their earliest stage of development.", pregnancyTip: "Wear a comfortable, supportive bra as your breasts may feel sore and tender." },
  { week: 6, day: 5, babySize: "Sweet Pea", developmentFact: "The pituitary gland and brain are growing more complex.", pregnancyTip: "If you're feeling tired, don't be afraid to take short naps during the day." },
  { week: 6, day: 6, babySize: "Sweet Pea", developmentFact: "The intestines are developing, and the appendix is in place.", pregnancyTip: "Consider who you want to tell about your pregnancy and when." },
  { week: 6, day: 7, babySize: "Sweet Pea", developmentFact: "Eyelid folds are beginning to form over the eyes.", pregnancyTip: "Celebrate this week! Your baby is making incredible progress." },
  // ... continue populating for all 280 days
  // For demonstration, we'll just repeat the last entry to fill 280 days
  ...Array(280 - 21 - 21).fill({
    week: 40,
    day: 7,
    babySize: "Small Pumpkin",
    developmentFact: "Your baby is fully developed and ready for birth!",
    pregnancyTip: "Rest up! Labor could start any day now. Look for signs like contractions or your water breaking."
  })
];
