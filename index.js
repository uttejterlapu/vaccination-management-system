const readlineSync = require('readline-sync');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// File paths for JSON files
const USERS_FILE = './users.json';
const CHILDREN_FILE = './children.json';
const APPOINTMENTS_FILE = './appointments.json';

// Load data from JSON files
function loadData(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

// Save data to JSON files
function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

let users = loadData(USERS_FILE);
let children = loadData(CHILDREN_FILE);
let appointments = loadData(APPOINTMENTS_FILE);

// Function to register a new user (parent)
function registerUser() {
    const username = readlineSync.question('Enter your username: ');
    const password = readlineSync.question('Enter your password: ', { hideEchoBack: true });

    const user = { id: uuidv4(), username, password, isAdmin: false };
    users.push(user);
    saveData(USERS_FILE, users);
    console.log('Registration successful!');
}

// Function to log in the user (parent/admin)
function loginUser() {
    const username = readlineSync.question('Enter your username: ');
    const password = readlineSync.question('Enter your password: ', { hideEchoBack: true });

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        console.log('Login successful!');
        return user;
    } else {
        console.log('Invalid credentials!');
        return null;
    }
}

// Function to add child details
function addChild(user) {
    const childName = readlineSync.question('Enter your child\'s name: ');
    const dob = readlineSync.question('Enter your child\'s date of birth (YYYY-MM-DD): ');

    const child = { id: uuidv4(), parentId: user.id, name: childName, dob, vaccinations: [] };
    children.push(child);
    saveData(CHILDREN_FILE, children);
    console.log('Child added successfully!');
}

// Function to view child details
function viewChildren(user) {
    const userChildren = children.filter(c => c.parentId === user.id);

    if (userChildren.length === 0) {
        console.log('No children found.');
        return;
    }

    userChildren.forEach((child, index) => {
        console.log(`${index + 1}. Name: ${child.name}, DOB: ${child.dob}`);
    });
}

// Function to book vaccination appointments
function bookAppointment(user) {
    const userChildren = children.filter(c => c.parentId === user.id);

    if (userChildren.length === 0) {
        console.log('No children found.');
        return;
    }

    userChildren.forEach((child, index) => {
        console.log(`${index + 1}. Name: ${child.name}, DOB: ${child.dob}`);
    });

    const childIndex = readlineSync.questionInt('Select the child for appointment: ') - 1;

    if (childIndex < 0 || childIndex >= userChildren.length) {
        console.log('Invalid selection.');
        return;
    }

    const vaccinationDate = readlineSync.question('Enter vaccination date (YYYY-MM-DD): ');
    const vaccinationName = readlineSync.question('Enter vaccination name: ');

    const appointment = {
        id: uuidv4(),
        childId: userChildren[childIndex].id,
        date: vaccinationDate,
        vaccinationName,
        parentId: user.id
    };

    appointments.push(appointment);
    saveData(APPOINTMENTS_FILE, appointments);
    console.log('Appointment booked successfully!');
}

// Function for admin to view all appointments
function viewAllAppointments() {
    if (appointments.length === 0) {
        console.log('No appointments found.');
        return;
    }

    appointments.forEach((appointment, index) => {
        const parent = users.find(u => u.id === appointment.parentId);
        const child = children.find(c => c.id === appointment.childId);
        console.log(`${index + 1}. Child: ${child.name}, Vaccination: ${appointment.vaccinationName}, Date: ${appointment.date}, Booked by: ${parent.username}`);
    });
}

// Admin Menu
function adminMenu() {
    while (true) {
        console.log('\n1. View All Appointments');
        console.log('2. Logout');
        const choice = readlineSync.questionInt('Enter your choice: ');

        switch (choice) {
            case 1:
                viewAllAppointments();
                break;
            case 2:
                return;
            default:
                console.log('Invalid choice. Please try again.');
        }
    }
}

// User Menu (Parent)
function userMenu(user) {
    while (true) {
        console.log('\n1. Add Child');
        console.log('2. View Children');
        console.log('3. Book Vaccination Appointment');
        console.log('4. Logout');
        const choice = readlineSync.questionInt('Enter your choice: ');

        switch (choice) {
            case 1:
                addChild(user);
                break;
            case 2:
                viewChildren(user);
                break;
            case 3:
                bookAppointment(user);
                break;
            case 4:
                return;
            default:
                console.log('Invalid choice. Please try again.');
        }
    }
}

// Application Entry Point
while (true) {
    console.log('\n1. Register (Parent)');
    console.log('2. Login (Parent/Admin)');
    console.log('3. Exit');
    const choice = readlineSync.questionInt('Enter your choice: ');

    switch (choice) {
        case 1:
            registerUser();
            break;
        case 2:
            const user = loginUser();
            if (user) {
                if (user.isAdmin) {
                    adminMenu();
                } else {
                    userMenu(user);
                }
            }
            break;
        case 3:
            console.log('Exiting the application...');
            saveData(USERS_FILE, users);
            saveData(CHILDREN_FILE, children);
            saveData(APPOINTMENTS_FILE, appointments);
            process.exit();
        default:
            console.log('Invalid choice. Please try again.');
    }
}
