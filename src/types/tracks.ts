// V7 Track Data Structure - Extracted from lines 1867-1913
export interface Track {
  title: string;
  art: string;
  full: string;
  short15: string;
  short30: string;
  description: string;
  tags: string[];
  duration: string;
  album: string;
}

// V7 trackData array - exactly as in V7
export const trackData: Track[] = [
  {
    title: "Wanderer's Lament",
    art: "https://static.wixstatic.com/media/ec6721_c7a874eb856048a1ab26d664a55f8d79~mv2.jpg",
    full: "https://static.wixstatic.com/mp3/ec6721_95b17096cd3c40a5b6086c8a4f2e3c66.wav",
    short15: "https://static.wixstatic.com/mp3/ec6721_a168349ca2e44ff8b7efbb79e7e6d963.wav",
    short30: "https://static.wixstatic.com/mp3/ec6721_69f870710d6b4c9e82a62e102511c9d2.wav",
    description: "A haunting blend of acoustic guitar and atmospheric synths that evokes solitude and reflection. Ideal for introspective scenes and dramatic character moments.",
    tags: ["Acoustic", "Atmospheric", "Cinematic", "Melancholic"],
    duration: "2:45",
    album: "Demo Tracks"
  },
  {
    title: "No Return",
    art: "https://static.wixstatic.com/media/ec6721_4237dc94e15c4933989186414adc294f~mv2.jpg",
    full: "https://static.wixstatic.com/mp3/ec6721_2e99f13c245e426e9819ce507c2ac866.wav",
    short15: "https://static.wixstatic.com/mp3/ec6721_1ffd05484a2f4c9597c2619813b5c109.wav",
    short30: "https://static.wixstatic.com/mp3/ec6721_32edc29a0b5f42d4a6b3f5cefabea1c7.wav",
    description: "A tense and atmospheric piece that builds suspense through minimalist instrumentation and subtle sound design. Excellent for thriller scenes and psychological drama.",
    tags: ["Tense", "Minimal", "Suspense", "Atmospheric"],
    duration: "2:47",
    album: "Demo Tracks"
  },
  {
    title: "Journey to Montopoli",
    art: "https://static.wixstatic.com/media/ec6721_28bb0f813846496aafad733a01e903bb~mv2.jpg",
    full: "https://static.wixstatic.com/mp3/ec6721_c150917418ca43d899c63136df049d5f.wav",
    short15: "https://static.wixstatic.com/mp3/ec6721_a6f26b1ca0194fdfa906baf57b98aa3f.wav",
    short30: "https://static.wixstatic.com/mp3/ec6721_9df7e6296094406582e395987b228fa9.wav",
    description: "An epic orchestral adventure that builds from intimate piano melodies to sweeping cinematic crescendos. Perfect for travel montages and emotional character journeys.",
    tags: ["Orchestral", "Epic", "Adventure", "Crescendo"],
    duration: "2:45",
    album: "Demo Tracks"
  },
  {
    title: "Beyond the Horizon",
    art: "https://static.wixstatic.com/media/ec6721_2ce1477d9059440fb009d7468a1e0c88~mv2.png",
    full: "https://static.wixstatic.com/mp3/ec6721_95d40f66afcd485190d01558e3c27dd4.wav",
    short15: "https://static.wixstatic.com/mp3/ec6721_76c0a77efd16409983f50ccff8a2d1d4.wav",
    short30: "https://static.wixstatic.com/mp3/ec6721_6818db3899f54d349f5c2a4c5809d8ea.wav",
    description: "An uplifting and expansive composition featuring soaring strings and hopeful melodies. Perfect for inspirational moments, success montages, and triumphant conclusions.",
    tags: ["Uplifting", "Orchestral", "Hopeful", "Triumphant"],
    duration: "3:12",
    album: "Demo Tracks"
  },
  {
    title: "Overthrown",
    art: "https://static.wixstatic.com/media/ec6721_7306cc312909435998d86345fa43e3e8~mv2.jpg",
    full: "https://static.wixstatic.com/mp3/ec6721_9e777bb7f872455f9025d37fba4d39da.wav",
    short15: "https://static.wixstatic.com/mp3/ec6721_0921a0c34fb748939c408a82b66ff46e.wav",
    short30: "https://static.wixstatic.com/mp3/ec6721_b3c501203acb4d988be4cba041a88b70.wav",
    description: "Intense and driving with powerful percussion and dark orchestral elements. Perfect for action sequences, conflict scenes, and high-stakes dramatic moments.",
    tags: ["Intense", "Percussion", "Dark", "Action"],
    duration: "2:58",
    album: "Demo Tracks"
  }
];