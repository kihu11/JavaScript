function getUserName() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("Никита");
        }, 1000);
    });
}

function getUserRole(username) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ name: username, role: "admin" });
        }, 1000);
    });
}

function getPermissions(user) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ...user, permissions: ["read", "write", "delete"] });
        }, 1000);
    });
}

getUserName()
    .then((username) => getUserRole(username))
    .then((user) => getPermissions(user))
    .then((result) => {
        console.log("Данные пользователя:", result);
    })
    .catch((error) => {
        console.error("Ошибка:", error);
    })
    .finally(() => {
        console.log("Цепочка промисов завершена.");
    });