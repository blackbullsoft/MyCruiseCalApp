import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userInfo: null,
    },
    reducers: {
        setUser: (state, action) => {
            // Extract only serializable fields
            const { displayName, email, photoURL, uid } = action.payload;
            state.userInfo = {
                displayName,
                email,
                photoURL,
                uid,
            };
        },
        clearUser: (state) => {
            state.userInfo = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
