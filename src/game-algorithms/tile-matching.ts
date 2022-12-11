import uuid from "react-uuid";
import { getNumberRangeArray, getNumberSequenceArray } from "../utils/array";

export const COLUMN_NUMBER = 9;
export const ROW_NUMBER = 9;

export const tilesAreAdjacent = (firstIndex: number, secondIndex: number): boolean => {
  const adjacentIndexes = [-COLUMN_NUMBER, 1, COLUMN_NUMBER, -1];
  const areAdjacent = adjacentIndexes.some(x => (x + firstIndex) === secondIndex);
  return areAdjacent;
};


type TileMovePosition = [number, number];

export const getTileTargetPosition = (index: number, tileTargetIndex: number): TileMovePosition => {
  const top = tileTargetIndex === index - ROW_NUMBER ? -100 : tileTargetIndex === index + ROW_NUMBER ? 100 : 0;
  const left = tileTargetIndex === index - 1 ? -100 : tileTargetIndex === index + 1 ? 100 : 0;
  return [top, left];
};

type CandyInLevel = { index: number } & Candy;

const getCandyMatchings = (candy: CandyInLevel, items: readonly LevelItem[]): MatchDetail => {
  //console.log(candy.index);
  const rowIndex = Math.ceil((candy.index + 1) / ROW_NUMBER);
  const columnIndex = (candy.index + 1) - ((rowIndex - 1) * ROW_NUMBER);

  const leftIterations = columnIndex - 1;
  const upIterations = rowIndex - 1;
  const rightIterations = COLUMN_NUMBER - columnIndex;
  const downIterations = ROW_NUMBER - rowIndex;

  const matchings = {
    "up": { count: 0, iterations: upIterations, getAdjacent: (cycle: number) => candy.index - (COLUMN_NUMBER * cycle) },
    "right": { count: 0, iterations: rightIterations, getAdjacent: (cycle: number) => candy.index + cycle },
    "down": { count: 0, iterations: downIterations, getAdjacent: (cycle: number) => candy.index + (COLUMN_NUMBER * cycle) },
    "left": { count: 0, iterations: leftIterations, getAdjacent: (cycle: number) => candy.index - cycle },
  };

  Object.values(matchings).forEach(direction => {
    for (let i = 1; i < direction.iterations + 1; i++) {
      const adjacentCandy = items[direction.getAdjacent(i)] || null;
      if ((adjacentCandy as Candy)?.color !== candy.color) break;
      direction.count += 1;
    }
  });

  const up = matchings.up.count;
  const right = matchings.right.count;
  const down = matchings.down.count;
  const left = matchings.left.count;
  const matched = (up > 0 && down > 0) || (left > 0 && right > 0) || [up, down, left, right].some(x => x > 1);

  /* console.log({
    up, right, down, left, matched
  }); */

  return { up, right, down, left, matched, index: candy.index };
};

const candyTypesArray = ["Candy", "SuperCandy"];
export const checkForMatchings = (items: readonly LevelItem[]): MatchResult => {
  const candies = [...items].map((x, index) => ({ ...x, index })).filter(x => candyTypesArray.includes((x as LevelItem)?.type || "")) as CandyInLevel[];

  const candyMatchings: ({ index: number } & MatchDetail)[] = [];
  candies.forEach(candy => candyMatchings.push(getCandyMatchings(candy, items)));

  return {
    thereWereMatches: candyMatchings.some(x => x.matched),
    matchingList: candyMatchings
  };
};

type ItemAbove = {
  index: number | null,
  tileDistanceCount: number
}

const getItemAbove = (itemIdex: number, items: readonly LevelItem[], tiles: readonly LevelTile[]): ItemAbove => {
  let nextItemIndex = itemIdex - COLUMN_NUMBER;
  let tileDistanceCount = 1;
  let aboveItem: number | null = null;

  while (nextItemIndex > -1) {
    const tileAvaliable = tiles[nextItemIndex] !== null;
    const itemEmtpy = items[nextItemIndex] === null;

    if (!tileAvaliable || itemEmtpy) {
      nextItemIndex -= COLUMN_NUMBER;
      tileDistanceCount += 1;
      continue;
    }

    aboveItem = nextItemIndex;
    break;
  };

  return {
    index: aboveItem,
    tileDistanceCount
  };
};

export type NewItemPosition = { index: number, tilesToMove: number };
type RepositionResult = {
  repositionedItems: LevelItem[],
  newPositions: NewItemPosition[]
};

export const repositionItems = (items: readonly LevelItem[], tiles: readonly LevelTile[]): RepositionResult => {
  const repositionedItems = structuredClone(items) as LevelItem[];
  const newPositions: NewItemPosition[] = []

  for (let i = repositionedItems.length - 1; i > 0; i--) {
    const tileAvaliable = tiles[i] !== null;
    if (!tileAvaliable) continue;
    const item = repositionedItems[i];

    if (item === null) {
      const itemAbove = getItemAbove(i, repositionedItems, tiles);
      if (itemAbove.index !== null) {
        repositionedItems[i] = structuredClone(repositionedItems[itemAbove.index]);
        repositionedItems[itemAbove.index] = null;
        newPositions.push({ index: itemAbove.index, tilesToMove: itemAbove.tileDistanceCount })
      }
    }
  }

  return {
    repositionedItems,
    newPositions
  }
};

const candyColorArray: string[] = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];
export const tryGetLevelItemByFusion = (matchDetail: MatchDetail, previousItem: LevelItem): LevelItem => {
  let item: LevelItem = null;
  const superCandyFusion = (matchDetail.left + matchDetail.right) > 2 || (matchDetail.down + matchDetail.up) > 2;
  const chocolateFusion = [matchDetail.up, matchDetail.left, matchDetail.right, matchDetail.down].filter(x => x > 1).reduce((acc, curr) => acc + curr, 0) > 3;

  const previousItemWasACandy = previousItem?.type === "Candy" || previousItem?.type === "SuperCandy";
  if (!previousItemWasACandy) return null

  if (superCandyFusion) {
    item = {
      color: previousItem?.color,
      type: "SuperCandy",
      key: uuid()
    } as SuperCandy;
  }

  if (chocolateFusion) {
    item = {
      type: "Chocolate",
      key: uuid()
    } as Chocolate;
  }

  return item;
}

const getRandomColorCandy = (): LevelItem => {
  return {
    color: candyColorArray[Math.floor(Math.random() * candyColorArray.length)],
    type: "Candy",
    key: uuid()
  } as Candy;
};

export const generateNewCandies = (items: readonly LevelItem[], tiles: readonly LevelTile[]): LevelItem[] => {
  const newCandies = structuredClone(items) as LevelItem[];
  newCandies.forEach((item, index) => {
    const tileAvaliable = tiles[index] !== null;
    if (item === null && tileAvaliable) newCandies[index] = getRandomColorCandy()
  });

  return newCandies;
};

export const getHorizontalAndVerticalItems = (startIndex: number): (number | null)[] => {
  const rowIndex = Math.ceil((startIndex + 1) / ROW_NUMBER);
  const columnIndex = (startIndex + 1) - ((rowIndex - 1) * ROW_NUMBER);

  const horizontalRangeStart = ((rowIndex - 1) * COLUMN_NUMBER);
  const horizontalRangeEnd = horizontalRangeStart + (COLUMN_NUMBER - 1);

  const horizontalItems = getNumberRangeArray(horizontalRangeStart, horizontalRangeEnd);
  const verticalItems = getNumberSequenceArray(columnIndex - 1, ROW_NUMBER - 1, COLUMN_NUMBER);

  return [...horizontalItems, ...verticalItems];
};

export const allTilesFilled = (items: readonly LevelItem[], tiles: readonly LevelTile[]): boolean => {
  return !(structuredClone(items) as LevelItem[]).some((x, index) => tiles[index] !== null && x === null);
};
