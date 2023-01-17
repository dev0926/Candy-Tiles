import { useRef, useState } from 'react';
import uuid from 'react-uuid';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ROW_NUMBER } from '../../../../../config';
import { getItemColumnIndex, getItemRowIndex } from '../../../../../game-algorithms/tile-matching';
import useEffectAfterFirstRender from '../../../../../hooks/useEffectAfterFirstRender';
import { levelItemsState } from '../../atoms/levelItems';
import { scoreState } from '../../atoms/score';
import { scoreFxListState } from '../../atoms/scoreFxList';
import iceCreamSprite from './../../../../../assets/img/candies/ice-cream.png';
import iceCreamMatchSFX from './../../../../../assets/audio/iceCreamMatch.mp3';
import { levelTasksState } from '../../atoms/levelTasks';

const ICE_CREAM_SCORE = 250;
type IceCreamProps = {
	id: string;
	index: number;
};

const playIceCreamMatch = () => {
	const iceCreamMatchSound = new Audio(iceCreamMatchSFX);
	iceCreamMatchSound.play();
};

const IceCream = ({ id, index }: IceCreamProps) => {
	const [show, setShow] = useState(true);
	const elementRef = useRef<HTMLImageElement | null>(null);
	const itemUsedRef = useRef(false);
	const levelItems = useRecoilValue(levelItemsState);
	const setScore = useSetRecoilState(scoreState);
	const setScoreFxList = useSetRecoilState(scoreFxListState);
	const setLevelTasks = useSetRecoilState(levelTasksState);

	useEffectAfterFirstRender(() => {
		const itemMatched = !levelItems.some(x => x?.key === id);
		itemMatched && !itemUsedRef.current && onItemMatch();
	}, [levelItems]);

	const onItemMatch = () => {
		itemUsedRef.current = true;
		playIceCreamMatch();
		setShow(false);
		setScore(score => score + ICE_CREAM_SCORE);
		setScoreFxList(list => [
			...list,
			{
				color: 'White',
				key: uuid(),
				position: [(getItemColumnIndex(index) - 1) * 100, (ROW_NUMBER - 1) * 100],
				score: ICE_CREAM_SCORE,
			},
		]);
		console.log('can you feel the sunshine');
		
		setLevelTasks(tasks => ({
			...tasks,
			iceCreams: tasks.iceCreams + 1,
		}));
	};

	return (
		<img
			data-ice-cream
			ref={elementRef}
			src={iceCreamSprite}
			className='w-full h-full m-0 select-none pointer-events-none duration-200'
			style={{
				display: show ? 'block' : 'none',
			}}
		></img>
	);
};

export default IceCream;
