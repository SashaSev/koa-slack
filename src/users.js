const users = [];

const addUser = ({ id, username, workspace }) => {
    username = username.trim().toLowerCase();
    workspace= workspace.trim().toLowerCase();

    // Validate the data
    if (!username || !workspace) {
        return {
            error: 'Username and Workspace are required!'
        }
    }

    const existingUser = users.find((user) => {
        return user.workspace === workspace && user.username === username
    });

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, workspace };
    users.push(user);
    return { user }
};

const getUser = (id) => {
    return users.find((user) => user.id === id)
};

const getUsersInWorkspace = (workspace) => {
    workspace = workspace.trim().toLowerCase();
    return users.filter((user) => user.workspace === workspace)
};

module.exports = {
    addUser,
    getUser,
    getUsersInWorkspace
};