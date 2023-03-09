import { Grid } from '@mui/material';
import { CompletedLevels } from '../../../store/completedLevels';
import SelectLevelButton from './SelectLevelButton';

type Props = {
	completedLevels: CompletedLevels;
};
const MainLevelsTab = ({ completedLevels }: Props) => {
	return (
		<Grid container columns={{ xs: 2, sm: 4, md: 8 }} spacing={2} padding={2}>
			{new Array(50).fill(0).map((x, index) => {
				const levelAvaliable = index === 0 || completedLevels.main.some((x) => x.id === index);
				const stars = completedLevels.main.find((x) => x.id === index + 1)?.stars || 0;
				return (
					<Grid item xs={1} key={index}>
						<SelectLevelButton locked={!levelAvaliable} stars={stars} levelId={index + 1} />{' '}
					</Grid>
				);
			})}
		</Grid>
	);
};

export default MainLevelsTab;