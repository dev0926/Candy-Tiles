import red from './../../../../assets/candies/red.png';
import orange from './../../../../assets/candies/orange.png';
import yellow from './../../../../assets/candies/yellow.png';
import green from './../../../../assets/candies/green.png';
import blue from './../../../../assets/candies/blue.png';
import purple from './../../../../assets/candies/purple.png';
import { useEffect, useRef } from 'react';
import LevelManager from './level-manager';

export const CandyColors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];

const candyImages: { [key: string]: string } = {
	'Red': red,
	'Orange': orange,
	'Yellow': yellow,
	'Green': green,
	'Blue': blue,
	'Purple': purple,
};

type CandyProps = {
	color: CandyColor;
	index: number;
	id: string;
};

const Candy = ({ color, index, id }: CandyProps) => {
  const firstRender = useRef<boolean>(true);
	const elementRef = useRef<HTMLDivElement | null>(null);
	const rowIndexRef = useRef<number>(0);
	const columnIndexRef = useRef<number>(0);
	const positionXRef = useRef<number>(0);
	const positionYRef = useRef<number>(0);

	useEffect(() => {
    firstRender.current = false;
		updatePosition();
		LevelManager.subscribeItemsChange(onLevelItemsChanged);

		return () => {
			LevelManager.unsubscribeItemsChange(onLevelItemsChanged);
		};
	}, []);

	const onLevelItemsChanged = (items: LevelItem[], matched: boolean): void => {
		const candyMatched = !items.some(x => x?.key === id);
		candyMatched && updateOpacity('0');
		!candyMatched && updatePosition();
	};

	const updateGridPosition = () => {
		const gridIndex = LevelManager.levelData.items.findIndex(x => x?.key === id);
		rowIndexRef.current = Math.ceil((gridIndex + 1) / 9);
		columnIndexRef.current = gridIndex + 1 - (rowIndexRef.current - 1) * 9;
		positionXRef.current = 100 * (columnIndexRef.current - 1);
		positionYRef.current = firstRender.current ? -500 : 100 * (rowIndexRef.current - 1);
	};

	const updatePosition = () => {
    updateGridPosition();
		if (elementRef.current) {
			elementRef.current.style.transform = `translate(${positionXRef.current}%, ${positionYRef.current}%)`;
		}
	};

	const updateOpacity = (value: string) => {
		if (elementRef.current) elementRef.current.style.opacity = value;
	};

	updateGridPosition();

	return (
		<div
			className={`w-[calc(100%/9)] p-[1.7%] aspect-square block absolute duration-300`}
			style={{
				transform: `translate(${positionXRef.current}%, ${positionYRef.current}%)`,
			}}
			data-candy
			ref={elementRef}
			data-index={index}
			data-color={color}
		>
			<img src={candyImages[color]} className="block rounded-full w-full h-full m-0 select-none pointer-events-none"></img>
		</div>
	);
};

export default Candy;
