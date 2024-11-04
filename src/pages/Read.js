import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, onValue, push, set } from 'firebase/database';
import { database, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sheet } from 'react-modal-sheet';
import ReactPlayer from 'react-player';
import './Read.css';

function Read() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [newsItem, setNewsItem] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);  // Scroll ke atas

        const newsRef = ref(database, `News/${id}`);
        const startTime = Date.now();

        get(newsRef).then((snapshot) => {
            if (snapshot.exists()) {
                setNewsItem(snapshot.val());
            }
        });

        const commentsRef = ref(database, `Comments/${id}`);
        onValue(commentsRef, (snapshot) => {
            if (snapshot.exists()) {
                const commentsData = snapshot.val();
                const commentsArray = Object.keys(commentsData).map(key => ({
                    id: key,
                    ...commentsData[key],
                }));
                commentsArray.sort((a, b) => b.timestamp - a.timestamp);
                setComments(commentsArray);
            }
        });

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userRef = ref(database, `users/${currentUser.uid}`);
                get(userRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.val());
                    }
                });
            }
        });

        const minimumLoadingTime = 5000; 
        const loadingTimer = setTimeout(() => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(minimumLoadingTime - elapsedTime, 0);
            setTimeout(() => {
                setIsLoading(false);
            }, remainingTime);
        }, minimumLoadingTime);

        return () => {
            clearTimeout(loadingTimer);
            unsubscribe();
        };
    }, [id]);

    const handleShareClick = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success('Berhasil disalin! Silahkan share ...');
            })
            .catch(err => console.error('Gagal menyalin: ', err));
    };

    const handleCommentSubmit = () => {
        if (!user) {
            toast.error('Silakan login untuk menambahkan komentar.');
            navigate('/login');
            return;
        }

        if (commentText.trim() === '') {
            toast.error('Komentar tidak boleh kosong');
            return;
        }

        const commentsRef = ref(database, `Comments/${id}`);
        const newCommentRef = push(commentsRef);
        set(newCommentRef, {
            text: commentText,
            timestamp: Date.now(),
            fullName: userProfile?.fullName || user.email || 'Anonymous',
        }).then(() => {
            setCommentText('');
            setModalOpen(false);
            toast.success('Komentar berhasil ditambahkan!');
        }).catch((error) => {
            console.error('Error adding comment: ', error);
            toast.error('Gagal menambahkan komentar.');
        });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/media-id.appspot.com/o/media-logo.png?alt=media&token=e94d5dc6-77e3-47cb-b98a-4db024d73335"
                    alt="Loading"
                    className="loading-image"
                />
                <p>Loading... Media ID </p>
                <p>(Artificial Intelligence News Indonesia)</p>
            </div>
        );
    }

    return (
        <div className="read-page">
            <h3 style={{ textAlign: 'justify' }}>{newsItem.title}</h3>

            <img src={newsItem.image} alt={newsItem.title} className="news-image" />
            <p className="news-date">Published on: {new Date(newsItem.date).toLocaleString()}</p>
            <p className="news-summary">
                {newsItem.summary.split('<br />').map((line, index) => (
                    <span key={index}>
                        {line}
                        <br /><br />
                    </span>
                ))}
            </p>
            <button className="share-button" onClick={handleShareClick}>📨 Share Berita Ini</button>

            {newsItem.url && (
                <div className="video-container">
                    <ReactPlayer
                        url={newsItem.url}
                        className="react-player"
                        width="100%"
                        height="100%"
                        controls
                    />
                </div>
            )}

            <button onClick={() => setModalOpen(true)}>Tambah Komentar</button>

            <div className="comments-section">
                <h2>Komentar</h2>
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="comment">
                            <p>{comment.text}</p>
                            <p className="comment-info">
                                {comment.fullName} - {new Date(comment.timestamp).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Tidak ada komentar.</p>
                )}
            </div>

            {newsItem.ads && (
                <div className="ads-container">
                    <img src={newsItem.ads} alt="Advertisement" className="ads-image" />
                </div>
            )}

            <Sheet isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <Sheet.Container>
                    <Sheet.Header />
                    <Sheet.Content>
                        <div className="modal-sheet-content">
                            <h2>Tambahkan Komentar</h2>
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Tulis komentar..."
                            />
                            <button onClick={handleCommentSubmit}>Kirim</button>
                        </div>
                    </Sheet.Content>
                </Sheet.Container>
            </Sheet>

            <ToastContainer />
        </div>
    );
}

export default Read;
