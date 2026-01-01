import React,
    {
    createContext,
    useContext,
    useState,
    useCallback
}

from 'react';
import './Toast.scss';

const ToastContext=createContext();

export const useToast=()=> {
    const context=useContext(ToastContext);

    if ( !context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
}

;

export const ToastProvider=( {
        children
    }

)=> {
    const [toasts,
    setToasts]=useState([]);

    const addToast=useCallback((message, type='info', duration=3000)=> {
            const id=Date.now();

            const toast= {
                id, message, type, duration
            }

            ;

            setToasts((prevToasts)=> [...prevToasts, toast]);

            // Auto remove after duration
            if (duration > 0) {
                setTimeout(()=> {
                        removeToast(id);
                    }

                    , duration);
            }

            return id;
        }

        , []);

    const removeToast=useCallback((id)=> {
            setToasts((prevToasts)=> prevToasts.filter((toast)=> toast.id !==id));
        }

        , []);

    const success=useCallback((message, duration)=> {
            return addToast(message, 'success', duration);
        }

        , [addToast]);

    const error=useCallback((message, duration)=> {
            return addToast(message, 'error', duration);
        }

        , [addToast]);

    const info=useCallback((message, duration)=> {
            return addToast(message, 'info', duration);
        }

        , [addToast]);

    const warning=useCallback((message, duration)=> {
            return addToast(message, 'warning', duration);
        }

        , [addToast]);

    return (<ToastContext.Provider value= {
                {
                success, error, info, warning
            }
        }

        > {
            children
        }

        <div className="toast-container"> {
            toasts.map((toast)=> (<Toast key= {
                        toast.id
                    }

                    message= {
                        toast.message
                    }

                    type= {
                        toast.type
                    }

                    onClose= {
                        ()=> removeToast(toast.id)
                    }

                    />))
        }

        </div> </ToastContext.Provider>);
}

;

const Toast=( {
        message, type, onClose
    }

)=> {
    const getIcon=()=> {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                default: return 'ℹ';
        }
    }

    ;

    return (<div className={`toast toast-${type}`}

        > <div className="toast-icon"> {
            getIcon()
        }

        </div> <div className="toast-message"> {
            message
        }

        </div> <button className="toast-close"onClick= {
            onClose
        }

        > × </button> </div>);
}

;

export default ToastProvider;