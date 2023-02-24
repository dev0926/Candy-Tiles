import { LoadingButton } from '@mui/lab';
import { Button, DialogContent, DialogTitle, FormHelperText, InputAdornment, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { useState, useEffect } from 'react';
import { MdLock } from 'react-icons/md';
import { useRecoilState } from 'recoil';
import useDeleteAccount from '../../hooks/useDeleteAccount';
import TextFieldMain from '../../mui/components/TextFieldMain';
import Dialog from '../Dialog';
import InputAdornmentLoader from '../InputAdornmentLoader';
import { showDeleteAccountDialogState } from './../../store/showDeleteAccountDialog';

const DeleteAccountDialog = () => {
	const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useRecoilState(showDeleteAccountDialogState);
	const [passwordValue, setPasswordValue] = useState('');
	const { deleteAccountMutation, errorMessage } = useDeleteAccount();

	useEffect(() => {
		deleteAccountMutation.isSuccess && setShowDeleteAccountDialog(false);
	}, [deleteAccountMutation.isSuccess]);

	const dialogOnClose = () => setShowDeleteAccountDialog(false);
	const passwordOnBlur = () => false;
	const deleteOnClick = () => deleteAccountMutation.mutate(passwordValue);

	return (
		<Dialog open={showDeleteAccountDialog} onClose={dialogOnClose} fullWidth maxWidth="xs">
			<DialogTitle>Delete account</DialogTitle>
			<DialogContent>
				<Stack spacing={2} alignItems="flex-start">
					<TextFieldMain
						label="Confirm password"
						type="password"
						variant="filled"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									{false ? <InputAdornmentLoader /> : <MdLock className="max-w-[16px]"></MdLock>}
								</InputAdornment>
							),
						}}
						helperText={''}
						error={false}
						onChange={(e) => setPasswordValue(e.target.value)}
						onBlur={passwordOnBlur}
					></TextFieldMain>
					<FormHelperText error hidden={!deleteAccountMutation.isError}>
						{errorMessage}
					</FormHelperText>
					<LoadingButton
						loading={deleteAccountMutation.isLoading}
						variant="contained"
						color="error"
						disabled={passwordValue.length === 0}
						disableElevation
						onClick={deleteOnClick}
						sx={{
							'&&': {
								marginLeft: 'auto',
							},
						}}
					>
						Delete
					</LoadingButton>
				</Stack>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteAccountDialog;
