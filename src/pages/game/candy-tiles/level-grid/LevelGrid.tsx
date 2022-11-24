import Tile from './Tile';
import { useEffect, useRef, useState } from 'react';
import { tilesAreAdjacent } from '../../../../utils/tile-matching';
import { levelList } from '../../../../data/level-layouts';
import Candy from './Candy';
import { useLevelContext } from '../../../../context/LevelContext';
import LevelManager from './level-manager';
import uuid from 'react-uuid';

const elementIsTile = (element: HTMLElement) => element.hasAttribute('data-tile');

const LevelGrid = () => {
	const [selectedTiles, setSelectedTiles] = useState<HTMLElement[]>([]);
	const dragging = useRef<boolean>(false);
	const selectedLevelLayout = levelList[0];
	const levelContext = useLevelContext();
	const firstTile = useRef<HTMLElement | null>();

	useEffect(() => {
		const initialItems = selectedLevelLayout.items;
		initialItems.forEach(x => x !== null && (x.key = uuid()));

		const initialTiles = selectedLevelLayout.tiles;

		levelContext?.updateLevelItems(initialItems);
		LevelManager.setItems(initialItems, false);
		LevelManager.setTiles(initialTiles, false);
	}, []);

	useEffect(() => {}, [levelContext?.selectedTiles]);

	const handleMouseDown = (e: React.MouseEvent): void => {
		if (!elementIsTile(e.target as HTMLElement)) return;
		dragging.current = true;
		firstTile.current = e.target as HTMLElement;
	};

	const handleMouseUp = (e: React.MouseEvent): void => {
		firstTile.current = null;
		dragging.current = false;
	};

	const handleMouseOver = (e: React.MouseEvent): void => {
		if (!elementIsTile(e.target as HTMLElement) || !firstTile.current || !dragging.current) return;

		const firstTileIndex = parseInt(firstTile.current.getAttribute('data-index') || '');
		const secondTileIndex = parseInt((e.target as HTMLElement).getAttribute('data-index') || '');

		if (!tilesAreAdjacent(firstTileIndex, secondTileIndex)) {
			levelContext?.updateSelectedTiles([null, null]);
			return;
		}

		//levelContext?.updateSelectedTiles([firstTileIndex, secondTileIndex]);
		LevelManager.swapItems([firstTileIndex, secondTileIndex]);
		firstTile.current = null;
	};

	return (
		<section
			className="border border-white grow aspect-square rounded-lg overflow-hidden relative select-none"
			style={{
				pointerEvents: levelContext?.lockInteraction ? 'none' : 'auto',
			}}
		>
			<div
				className="grid grid-rows-[repeat(9,1fr)] grid-cols-[repeat(9,1fr)] absolute top-0 left-0 w-full h-full"
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseOver={handleMouseOver}
			>
				{selectedLevelLayout.tiles.map((tile, index) =>
					tile === null ? <div key={index}></div> : <Tile key={index} selectedTiles={selectedTiles} index={index}></Tile>
				)}
			</div>

			<div className="absolute top-0 left-0 w-full h-full pointer-events-none">
				{levelContext?.currentLevelItems.map((item, index) => {
					const id = uuid();
					return selectedLevelLayout.tiles[index] === null ? (
						<div key={index}></div>
					) : (item as Candy)?.type === 'Candy' ? (
						<Candy key={(item as Candy).key} color={(item as Candy).color} index={index} id={item?.key || ''}></Candy>
					) : (
						<div key={id}></div>
					);
				})}
			</div>
		</section>
	);
};

export default LevelGrid;
