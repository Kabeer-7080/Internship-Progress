function StudentProfile(props) {
  return (
    <div className="card">
      <img
        src={props.image}
        alt={props.name}
        className="profile-img"
      />

      <h2>{props.name}</h2>

      <p><strong>Age:</strong> {props.age}</p>

      <p><strong>Course:</strong> {props.course}</p>

      <p><strong>College:</strong> {props.college}</p>

      <p><strong>Email:</strong> {props.email}</p>
    </div>
  );
}

export default StudentProfile;