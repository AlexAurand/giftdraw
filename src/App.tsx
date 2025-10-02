import { useState } from "react";
import "./App.css";
import { useImmer } from "use-immer";

type Family = {
  name: string;
  members: string[];
};

type Assignment = string[];

export function App() {
  const [assignments, setAssignments] = useState([] as Assignment[]);

  const [families, setFamilies] = useImmer([
    { name: "Family A", members: ["Alice", "Bob"] },
    { name: "Family B", members: ["Carlos", "Dawn"] },
  ] as Family[]);

  return (
    <>
      <div className="hbox">
        <div className="card">
          <h1>Giftdraw</h1>

          <button onClick={() => setAssignments(computeAssignments(families))}>
            Draw!
          </button>

          <textarea
            name="Families"
            id="families"
            disabled
            onChange={({ target }) => {
              let f;
              try {
                f = JSON.parse(target.value);
              } catch (e) {
                console.error(e);
              }
              if (f) setFamilies(f);
            }}
          >
            {JSON.stringify(families, undefined, 2)}
          </textarea>

          {families.map((f, i) => {
            return (
              <div key={i} className="card">
                <input
                  value={f.name}
                  onChange={({ target }) =>
                    setFamilies((draft) => {
                      draft[i].name = target.value;
                    })
                  }
                />
                <ul>
                  {f.members.map((m, j) => {
                    return (
                      <li>
                        <input
                          value={m}
                          onChange={({ target }) =>
                            setFamilies((draft) => {
                              draft[i].members[j] = target.value;
                            })
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="column">
          <h1>Assigments</h1>
          <pre>{JSON.stringify(assignments)}</pre>
        </div>
      </div>
    </>
  );
}

function computeAssignments(families: Family[]): Assignment[] {
  console.log(families);
  return [
    ...families[0].members.map((_, i) => [
      families[0].members[i],
      families[1].members[i],
    ]),
    ...families[1].members.map((_, i) => [
      families[1].members[i],
      families[0].members[i],
    ]),
  ];
}
