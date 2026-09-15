import api from "../../api/client";

export default function Enquiries({ enquiries, reload }) {
  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>City</th>
            <th>Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.phone}</td>
              <td>{e.city}</td>
              <td>{e.message}</td>
              <td>
                <select
                  value={e.status}
                  onChange={async (x) => {
                    await api.patch(`/admin/enquiries/${e.id}`, {
                      status: x.target.value,
                    });
                    reload();
                  }}
                >
                  <option>new</option>
                  <option>contacted</option>
                  <option>closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
