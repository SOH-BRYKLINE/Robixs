<?php
/*******************************************************
 * PHP CRUD Application - Users Management
 * Author: OVERLORD
 * Description: Demonstrates a full working CRUD app.
 *******************************************************/

// ======= CONFIGURATION =======
$host = "localhost";       // Database host
$user = "root";            // Database username
$pass = "";                // Database password
$dbname = "test_db";       // Database name

// ======= DATABASE CONNECTION =======
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// ======= CREATE TABLE IF NOT EXISTS =======
$conn->query("
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
");

// ======= HANDLE CREATE =======
if (isset($_POST['create'])) {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);

    if ($name && $email) {
        $stmt = $conn->prepare("INSERT INTO users (name, email) VALUES (?, ?)");
        $stmt->bind_param("ss", $name, $email);
        $stmt->execute();
        $stmt->close();
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    }
}

// ======= HANDLE DELETE =======
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
    header("Location: " . $_SERVER['PHP_SELF']);
    exit;
}

// ======= HANDLE UPDATE =======
if (isset($_POST['update'])) {
    $id = intval($_POST['id']);
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);

    if ($name && $email) {
        $stmt = $conn->prepare("UPDATE users SET name=?, email=? WHERE id=?");
        $stmt->bind_param("ssi", $name, $email, $id);
        $stmt->execute();
        $stmt->close();
        header("Location: " . $_SERVER['PHP_SELF']);
        exit;
    }
}

// ======= FETCH ALL USERS =======
$result = $conn->query("SELECT * FROM users ORDER BY id DESC");

?>
<!DOCTYPE html>
<html>
<head>
    <title>PHP CRUD Application</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f9f9f9;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 30px;
        }
        table, th, td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        th {
            background: #333;
            color: white;
        }
        form {
            margin-bottom: 20px;
        }
        input[type=text], input[type=email] {
            padding: 8px;
            width: 200px;
        }
        input[type=submit] {
            padding: 8px 12px;
            cursor: pointer;
        }
        .btn-delete {
            background: red;
            color: white;
            padding: 5px 8px;
            text-decoration: none;
        }
        .btn-update {
            background: blue;
            color: white;
            padding: 5px 8px;
            text-decoration: none;
        }
    </style>
</head>
<body>

<h1>User Management</h1>

<!-- ======= CREATE FORM ======= -->
<h2>Add New User</h2>
<form method="post">
    <input type="text" name="name" placeholder="Name" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="submit" name="create" value="Add User">
</form>

<!-- ======= USER LIST ======= -->
<h2>All Users</h2>
<table>
    <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Created</th>
        <th>Actions</th>
    </tr>
    <?php while ($row = $result->fetch_assoc()) { ?>
        <tr>
            <td><?= htmlspecialchars($row['id']) ?></td>
            <td><?= htmlspecialchars($row['name']) ?></td>
            <td><?= htmlspecialchars($row['email']) ?></td>
            <td><?= htmlspecialchars($row['created_at']) ?></td>
            <td>
                <!-- Update Form -->
                <form method="post" style="display:inline;">
                    <input type="hidden" name="id" value="<?= $row['id'] ?>">
                    <input type="text" name="name" value="<?= htmlspecialchars($row['name']) ?>" required>
                    <input type="email" name="email" value="<?= htmlspecialchars($row['email']) ?>" required>
                    <input type="submit" name="update" value="Update">
                </form>
                <!-- Delete Link -->
                <a class="btn-delete" href="?delete=<?= $row['id'] ?>" onclick="return confirm('Delete this user?');">Delete</a>
            </td>
        </tr>
    <?php } ?>
</table>

</body>
</html>
