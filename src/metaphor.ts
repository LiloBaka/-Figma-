export type PickerFormat = "L" | "S";
export type PickedItem = { assetId: string; role: "main" | "background" };
export type MetaphorPick = {
  templateId: "compact_L" | "compact_S" | "offset_L" | "offset_S" | "headline_L" | "headline_S";
  items: ReadonlyArray<PickedItem>;
  explanation: string;
  fallback: boolean;
};

type Recipe = {
  keywords: ReadonlyArray<string>;
  template: "compact" | "offset" | "headline";
  items: ReadonlyArray<PickedItem>;
  explanation: string;
};

// The terms deliberately point only to IDs and tags present in spec/assets.json.
const recipes: ReadonlyArray<Recipe> = [
  {
    keywords: ["обучение", "учеба", "учёба", "учиться", "знания", "курс", "learning", "education", "study", "training"],
    template: "headline",
    items: [{ assetId: "book", role: "main" }, { assetId: "pen", role: "background" }, { assetId: "lamp", role: "background" }],
    explanation: "Книга, ручка и лампа поддерживают тему обучения."
  },
  {
    keywords: ["фокус", "концентрация", "внимание", "сосредоточ", "focus", "concentration", "deep work"],
    template: "offset",
    items: [{ assetId: "headphones", role: "main" }, { assetId: "lamp", role: "background" }],
    explanation: "Наушники и свет обозначают спокойную концентрацию."
  },
  {
    keywords: ["решение задач", "задача", "проблем", "головолом", "problem solving", "problem", "solve", "solution"],
    template: "compact",
    items: [{ assetId: "puzzles", role: "main" }, { assetId: "pen", role: "background" }],
    explanation: "Пазлы и ручка передают поиск решения."
  },
  {
    keywords: ["совместная работа", "команда", "команд", "сотруднич", "коллаборац", "teamwork", "team work", "collaboration", "together"],
    template: "compact",
    items: [{ assetId: "phone", role: "main" }, { assetId: "folder", role: "background" }, { assetId: "puzzles", role: "background" }],
    explanation: "Телефон, папка и пазлы показывают координацию команды."
  }
];

const fallback: Recipe = {
  keywords: [],
  template: "compact",
  items: [{ assetId: "book", role: "main" }, { assetId: "lamp", role: "background" }],
  explanation: "Не удалось распознать метафору; собрана нейтральная композиция из книги и лампы."
};

const normalize = (value: string) => value.toLocaleLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

export const pickMetaphor = (text: string, format: PickerFormat): MetaphorPick => {
  const query = normalize(text);
  const recipe = recipes.find((candidate) => candidate.keywords.some((keyword) => query.includes(normalize(keyword)))) ?? fallback;
  return {
    templateId: `${recipe.template}_${format}`,
    items: recipe.items,
    explanation: recipe.explanation,
    fallback: recipe === fallback
  };
};
