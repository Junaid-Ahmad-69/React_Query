import {Link, Outlet, useNavigate, useParams} from 'react-router-dom';
import Header from '../Header.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {deleteEvent, fetchEvent, queryClient} from "../../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {useState} from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setDeleting] =useState(false)
  const navigate = useNavigate()
  const params = useParams()

  /// GET SINGLE EVENT
  const {data, isPending, isError, error} =  useQuery({
    queryKey: ['events', params.id],
    queryFn:({signal})=> fetchEvent({signal, id: params.id})
  })
  /// DELETE EVENT
  const {mutate, isPending: isPendingDeletion, isError: isErrorDeletion, error: deleteError} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: ()=> {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none',
      })
      navigate("/events")
    }
  })

  // DELETE EVENT MUTATION FUN
  const handleDeleteEvent= ()=> {
    mutate({id: params.id})
  }



  const handleStartDelete = ()=> setDeleting(true)

  const handleEndDelete = ()=> setDeleting(false)


  let content;
  if(isPending){
    content = <div id="event-details-content" className="center">
      <p>Fetching event data... </p>
    </div>
  }
  if(isError){
    content= <div id="event-details-content" className="center">
      <ErrorBlock title="Failed to load event" message={error.info?.message || "Failed to fetch the events..."}/>
    </div>
  }

  if(data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: "numeric"
    })
    content = <>
      <header>
        <h1>{data.title}</h1>
        <nav>
          <button onClick={ handleStartDelete}>Delete</button>
          <Link to="edit">Edit</Link>
        </nav>
      </header>
      <div id="event-details-content">
        <img src={`http://localhost:3000/${data.image}`} alt={data.title}/>
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {data.time}</time>
          </div>
          <p id="event-details-description">{data.description}</p>
        </div>
      </div>
      </>
      }

      return (
      <>
        {isDeleting && (<><Modal onClose={handleEndDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event? This action cannot be undo.</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting please wait...</p>}
            {!isPendingDeletion && (<>
                <button className="button-text" onClick={handleEndDelete}>Cancel</button>
                <button className="button" onClick={handleDeleteEvent}>Delete</button>
              </>)
            }
          </div>
        </Modal>
        {isErrorDeletion && <ErrorBlock title="Failed to delete the event" message={deleteError.info?.message || 'Failed to delete event, please try again later.' } />}
            </>
        )

        }
        <Outlet/>
        <Header>
          <Link to="/events" className="nav-item">
            View all Events
          </Link>
        </Header>
        <article id="event-details">
          {content}
        </article>
      </>
      );
      }