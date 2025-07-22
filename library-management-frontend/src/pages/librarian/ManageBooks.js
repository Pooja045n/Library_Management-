import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [csvFile, setCsvFile] = useState(null);

  const token = localStorage.getItem('token');

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/librarian/books', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(res.data);
    } catch (err) {
      console.error('Error fetching books', err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async () => {
  if (!title || !author || !category || !isbn) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const newBook = {
      title,
      author,
      category,
      isbn,
      available: true // explicitly add this if your backend needs it
    };

    await axios.post('http://localhost:5000/api/librarian/books/post', newBook, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    alert('Book added!');
    setTitle('');
    setAuthor('');
    setCategory('');
    setIsbn('');
    fetchBooks();
  } catch (err) {
    console.error('Error saving book:', err.response?.data || err.message);
    alert('Error saving book');
  }
};


  const handleCsvUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      await axios.post('http://localhost:5000/api/librarian/books/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      alert('CSV uploaded successfully!');
      fetchBooks();
    } catch (err) {
      alert('CSV upload failed');
      console.error(err);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/librarian/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Book deleted!');
      fetchBooks();
    } catch (err) {
      alert('Error deleting book');
      console.error(err);
    }
  };

  return (
    <div className="manage-books-container">
      <h3>📘 Manage Books</h3>

      <div className="d-flex mb-4 gap-2">
        <input type="text" className="form-control" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" className="form-control" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input type="text" className="form-control" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input type="text" className="form-control" placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
        <button className="btn btn-success" onClick={handleAddBook}>Add</button>
      </div>

      <div className="mb-3">
        <label>📎 Upload CSV:</label>
        <input type="file" className="form-control" onChange={(e) => setCsvFile(e.target.files[0])} />
        <button className="btn btn-primary mt-2" onClick={handleCsvUpload}>Upload CSV</button>
      </div>

      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>ISBN</th>
            <th>Available</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td>{book.isbn}</td>
              <td>{book.available ? '✅' : '❌'}</td>
              <td>
                {book.available ? (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteBook(book._id)}
                  >
                    Delete
                  </button>
                ) : (
                  <span style={{ color: '#888' }}>N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageBooks;
